import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from '../widgets/Header'
import { useMyCourses } from '../features/useMyCourses'
import { getLecture, syncLectureDurations } from '../shared/api/lectures'
import { saveProgress, completeLessonApi } from '../shared/api/subscriptions'
import { getLessonStatus, secondsToTimeString } from '../shared/utils/course'
import type { CurriculumSection } from '../types/course'

// ── YouTube IFrame API 최소 타입 ──────────────────────
interface YTPlayer {
    loadVideoById: (opts: { videoId: string; startSeconds?: number }) => void
    getCurrentTime: () => number
    seekTo: (seconds: number, allowSeekAhead: boolean) => void
    destroy: () => void
}

declare global {
    interface Window {
        YT: {
            Player: new (el: HTMLElement | string, config: object) => YTPlayer
            PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
        }
        onYouTubeIframeAPIReady: () => void
    }
}

const fmtSec = (s: number) => secondsToTimeString(s)

const SAVE_INTERVAL_MS = 15_000

export default function CourseWatch() {
    const urlParams = new URLSearchParams(window.location.search)
    const courseId        = Number(urlParams.get('courseId'))
    const initialLessonId = Number(urlParams.get('lessonId') || 0)
    const initialStart    = Number(urlParams.get('startSeconds') || 0)
    const isValidCourseId = !!courseId && !Number.isNaN(courseId)

    // ── 강의 데이터 ──────────────────────────────────
    const [course, setCourse] = useState<{
        id: number; title: string; youtubeId: string; curriculum: CurriculumSection[]
    } | null>(null)
    const [isLoading,     setIsLoading]     = useState(() => isValidCourseId)
    const [errorMessage,  setErrorMessage]  = useState<string | null>(() =>
        isValidCourseId ? null : '강의 정보를 찾을 수 없습니다.',
    )
    const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId)
    const [currentYoutubeId, setCurrentYoutubeId] = useState('')

    const { enrolledCourses, isCoursesLoading, completeLesson } = useMyCourses()
    const enrolled = enrolledCourses.find((c) => c.id === course?.id)

    // ── YouTube Player refs ──────────────────────────
    const playerRef        = useRef<YTPlayer | null>(null)
    const playerDivRef     = useRef<HTMLDivElement>(null)
    const ytReadyRef       = useRef(false)
    const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null)
    const pendingStartRef  = useRef(initialStart) // 다음 영상 시작 위치
    // 이벤트 핸들러 클로저용 ref
    const liveRef = useRef({ subscriptionId: 0, lessonId: 0, courseId: 0 })

    // ── 강의 로드 ─────────────────────────────────────
    useEffect(() => {
        if (!isValidCourseId) return

        ;(async () => {
            await syncLectureDurations(courseId).catch(() => {})
            const lecture = await getLecture(courseId)

            const curriculum = lecture.sections
                    .slice().sort((a, b) => a.order - b.order)
                    .map((s) => ({
                        id: s.id, title: s.title,
                        items: s.videos.slice().sort((a, b) => a.order - b.order).map((v) => ({
                            id: v.id,
                            title: v.title,
                            duration: secondsToTimeString(v.durationSec),
                            durationSec: v.durationSec,
                            youtubeId: v.youtubeId ?? undefined,
                            isPreview: v.isPreview ?? false,
                        })),
                    }))

                const primaryId = lecture.youtubeId ?? curriculum[0]?.items[0]?.youtubeId ?? ''
                setCourse({ id: lecture.id, title: lecture.title, youtubeId: primaryId, curriculum })

                // lessonId에 맞는 youtubeId 결정
                const targetId = initialLessonId || curriculum[0]?.items[0]?.id || 0
                const targetLesson = curriculum.flatMap((s) => s.items).find((i) => i.id === targetId)
                    ?? curriculum[0]?.items[0]

                if (targetLesson) {
                    setSelectedLessonId(targetLesson.id)
                    setCurrentYoutubeId(targetLesson.youtubeId || primaryId)
                }
        })()
            .catch(() => setErrorMessage('강의 정보를 불러오지 못했습니다.'))
            .finally(() => setIsLoading(false))
    }, [courseId, initialLessonId, isValidCourseId])

    // ── 미수강 접근 차단 ──────────────────────────────
    useEffect(() => {
        if (!course || enrolled || isCoursesLoading) return
        const current = course.curriculum.flatMap((s) => s.items).find((i) => i.id === selectedLessonId)
        if (current?.isPreview) return
        const preview = course.curriculum.flatMap((s) => s.items).find((i) => i.isPreview)
        if (preview) {
            queueMicrotask(() => {
                setSelectedLessonId(preview.id)
                setCurrentYoutubeId(preview.youtubeId || course.youtubeId)
            })
        }
    }, [course, enrolled, isCoursesLoading, selectedLessonId])

    // ── liveRef 동기화 ────────────────────────────────
    useEffect(() => {
        liveRef.current = {
            subscriptionId: enrolled?.subscriptionId ?? 0,
            lessonId:       selectedLessonId,
            courseId:       course?.id ?? 0,
        }
    }, [enrolled, selectedLessonId, course])

    // ── 진도 저장 ─────────────────────────────────────
    const saveCurrent = useCallback(() => {
        const { subscriptionId, lessonId } = liveRef.current
        if (!subscriptionId || !lessonId || !playerRef.current) return
        const secs = Math.floor(playerRef.current.getCurrentTime())
        if (secs > 0) saveProgress(subscriptionId, lessonId, secs).catch(() => {})
    }, [])

    const stopInterval = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }, [])

    // ── YouTube 상태 변경 핸들러 ──────────────────────
    // - PLAYING(1): 15초마다 자동 저장
    // - PAUSED(2) : 즉시 저장
    // - ENDED(0)  : 즉시 저장 + 자동 완료 처리
    const handleStateChange = useCallback((event: { data: number }) => {
        const { PLAYING, PAUSED, ENDED } = { PLAYING: 1, PAUSED: 2, ENDED: 0 }

        if (event.data === PLAYING) {
            stopInterval()
            intervalRef.current = setInterval(saveCurrent, SAVE_INTERVAL_MS)
        } else if (event.data === PAUSED) {
            stopInterval()
            saveCurrent()
        } else if (event.data === ENDED) {
            stopInterval()
            saveCurrent()
            // 자동 완료 처리
            const { subscriptionId, lessonId, courseId } = liveRef.current
            if (subscriptionId && lessonId) {
                completeLessonApi(subscriptionId, lessonId)
                    .then(() => completeLesson(courseId, lessonId))
                    .catch(() => {})
            }
        }
    }, [saveCurrent, stopInterval, completeLesson])

    // ── YouTube IFrame API 로드 & 플레이어 초기화/전환 ─
    useEffect(() => {
        if (!currentYoutubeId) return

        const startSecs = pendingStartRef.current
        pendingStartRef.current = 0 // 소비 후 초기화

        const initOrSwitch = () => {
            if (playerRef.current) {
                // 이미 플레이어 존재 → 영상만 교체
                playerRef.current.loadVideoById({ videoId: currentYoutubeId, startSeconds: startSecs })
                return
            }
            if (!playerDivRef.current) return
            playerRef.current = new window.YT.Player(playerDivRef.current, {
                videoId: currentYoutubeId,
                playerVars: { autoplay: 1, rel: 0, start: Math.floor(startSecs) },
                events: {
                    onStateChange: (e: { data: number }) => handleStateChange(e),
                },
            })
        }

        if (ytReadyRef.current) {
            initOrSwitch()
            return
        }

        // YouTube API 스크립트 로드 (중복 방지)
        const prev = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            prev?.()
            ytReadyRef.current = true
            initOrSwitch()
        }
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const script = document.createElement('script')
            script.src = 'https://www.youtube.com/iframe_api'
            document.head.appendChild(script)
        }

        return () => { stopInterval(); saveCurrent() }
    }, [currentYoutubeId]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── 강의 선택 ─────────────────────────────────────
    const selectedLesson = useMemo(() => {
        if (!course) return null
        for (const s of course.curriculum) {
            const item = s.items.find((i) => i.id === selectedLessonId)
            if (item) return item
        }
        return course.curriculum[0]?.items[0] ?? null
    }, [course, selectedLessonId])

    const canWatch = (item: CurriculumSection['items'][number]) => item.isPreview || !!enrolled

    const selectLesson = (item: CurriculumSection['items'][number]) => {
        if (!canWatch(item)) {
            alert('미리보기 영상만 시청할 수 있습니다. 수강신청 후 전체 강의를 시청하세요.')
            return
        }
        saveCurrent()

        // 이전에 시청했던 위치에서 자동 재개
        pendingStartRef.current = enrolled?.lessonProgress[item.id] ?? 0

        setSelectedLessonId(item.id)
        setCurrentYoutubeId(item.youtubeId || course?.youtubeId || '')

        const p = new URLSearchParams({
            courseId: String(courseId),
            lessonId: String(item.id),
            youtubeId: item.youtubeId || course?.youtubeId || '',
        })
        window.history.replaceState(null, '', `/course-watch?${p.toString()}`)
    }

    // ── 렌더링 ────────────────────────────────────────
    if (isLoading) return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="px-4 py-10 mx-auto text-center max-w-5xl text-slate-600">
                강의 정보를 불러오는 중입니다...
            </div>
        </div>
    )

    if (!course || !selectedLesson || errorMessage) return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="px-4 py-10 mx-auto text-center max-w-5xl">
                <p className="mb-4 text-lg font-semibold text-slate-700">
                    {errorMessage ?? '강의를 찾을 수 없습니다.'}
                </p>
                <button onClick={() => window.history.back()}
                    className="px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700">
                    돌아가기
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="px-4 py-6 mx-auto max-w-7xl">
                <button
                    onClick={() => { saveCurrent(); window.history.back() }}
                    className="mb-4 px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                    ← 돌아가기
                </button>

                <h1 className="mb-4 text-xl font-bold text-slate-900">{selectedLesson.title}</h1>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    {/* ── 비디오 플레이어 ── */}
                    <div className="relative overflow-hidden bg-black rounded-lg aspect-video">
                        <div ref={playerDivRef} className="absolute inset-0 w-full h-full" />
                    </div>

                    {/* ── 커리큘럼 사이드바 ── */}
                    <aside className="p-4 border rounded-lg bg-slate-50 max-h-[calc(100vh-8rem)] overflow-y-auto">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">커리큘럼</h2>
                        <div className="space-y-4">
                            {course.curriculum.map((section) => (
                                <div key={section.id}>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {section.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const active   = item.id === selectedLessonId
                                            const watched  = enrolled?.lessonProgress[item.id] ?? 0
                                            const status   = getLessonStatus(watched, item.durationSec)

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => selectLesson(item)}
                                                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                                                        active
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            {status === 'COMPLETED' && (
                                                                <span className="shrink-0 text-green-500 text-xs">✅</span>
                                                            )}
                                                            {status === 'IN_PROGRESS' && (
                                                                <span className={`shrink-0 text-xs ${active ? 'text-blue-200' : 'text-blue-500'}`}>▶</span>
                                                            )}
                                                            <span className="text-sm truncate">{item.title}</span>
                                                        </div>
                                                        <span className={`text-xs shrink-0 ${active ? 'text-blue-200' : 'text-slate-400'}`}>
                                                            {secondsToTimeString(item.durationSec)}
                                                        </span>
                                                    </div>

                                                    {status === 'IN_PROGRESS' && (
                                                        <p className={`text-xs mt-0.5 ${active ? 'text-blue-200' : 'text-blue-400'}`}>
                                                            {fmtSec(watched)} 까지 시청
                                                        </p>
                                                    )}
                                                    {status === 'COMPLETED' && (
                                                        <p className={`text-xs mt-0.5 ${active ? 'text-blue-100' : 'text-green-500'}`}>
                                                            시청 완료
                                                        </p>
                                                    )}

                                                    {item.isPreview && (
                                                        <span className={`text-xs ${active ? 'text-blue-200' : 'text-blue-500'}`}>
                                                            미리보기
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

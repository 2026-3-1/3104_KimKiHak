import { useEffect, useMemo, useState } from 'react'
import Header from '../widgets/Header'
import { useMyCourses } from '../features/useMyCourses'
import { getLecture } from '../shared/api/lectures'

const CourseWatch = () => {
    const params = new URLSearchParams(window.location.search)
    const courseId = Number(params.get('courseId'))
    const initialLessonId = Number(params.get('lessonId') || 0)

    const [course, setCourse] = useState<{
        id: number
        title: string
        youtubeId: string
        curriculum: {
            id: number
            title: string
            items: {
                id: number
                title: string
                duration: string
                youtubeId?: string
                isPreview?: boolean
            }[]
        }[]
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [selectedLessonId, setSelectedLessonId] = useState<number>(initialLessonId)
    const { completeLesson, enrolledCourses } = useMyCourses()

    const currentEnrolledCourse = enrolledCourses.find(c => c.id === course?.id)
    const isCompleted = currentEnrolledCourse?.completedLessons?.includes(selectedLessonId) || false

    useEffect(() => {
        if (!courseId || Number.isNaN(courseId)) {
            setErrorMessage('강의 정보를 찾을 수 없습니다.')
            setIsLoading(false)
            return
        }

        const toDuration = (seconds: number) => {
            const minutes = Math.floor(seconds / 60)
            const remaining = Math.floor(seconds % 60)
            return `${minutes}:${remaining.toString().padStart(2, '0')}`
        }

        const loadCourse = async () => {
            try {
                const lecture = await getLecture(courseId)
                const curriculum = lecture.sections
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map(section => ({
                        id: section.id,
                        title: section.title,
                        items: section.videos
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map(item => ({
                                id: item.id,
                                title: item.title,
                                duration: toDuration(item.durationSec),
                                youtubeId: item.youtubeId ?? undefined,
                                isPreview: item.isPreview ?? false,
                            })),
                    }))

                const primaryYoutubeId =
                    lecture.youtubeId ??
                    curriculum[0]?.items[0]?.youtubeId ??
                    ''

                setCourse({
                    id: lecture.id,
                    title: lecture.title,
                    youtubeId: primaryYoutubeId,
                    curriculum,
                })

                if (!initialLessonId && curriculum[0]?.items[0]) {
                    setSelectedLessonId(curriculum[0].items[0].id)
                }
            } catch (error) {
                console.error(error)
                setErrorMessage('강의 정보를 불러오지 못했습니다.')
            } finally {
                setIsLoading(false)
            }
        }

        loadCourse()
    }, [courseId, initialLessonId])

    useEffect(() => {
        if (!course || !currentEnrolledCourse) return
        if (currentEnrolledCourse.completedLessons?.includes(selectedLessonId)) return
        const totalLessons = course.curriculum.reduce((sum, section) => sum + section.items.length, 0)
        completeLesson(course.id, selectedLessonId, totalLessons)
    }, [completeLesson, course, currentEnrolledCourse, selectedLessonId])

    const selectedLesson = useMemo(() => {
        if (!course) return null
        for (const section of course.curriculum) {
            const item = section.items.find((i) => i.id === selectedLessonId)
            if (item) return item
        }
        return course.curriculum[0]?.items[0] ?? null
    }, [course, selectedLessonId])

    const [currentYoutubeId, setCurrentYoutubeId] = useState<string>(
        params.get('youtubeId') || ''
    )

    useEffect(() => {
        if (!course || !selectedLesson) return
        const nextId = selectedLesson.youtubeId || course.youtubeId
        if (nextId && nextId !== currentYoutubeId) {
            setCurrentYoutubeId(nextId)
        }
    }, [course, selectedLesson, currentYoutubeId])

    const updateLesson = (item: NonNullable<typeof course>['curriculum'][number]['items'][number]) => {
        setSelectedLessonId(item.id)
        if (!course) return
        setCurrentYoutubeId(item.youtubeId || course.youtubeId)
        const newParams = new URLSearchParams({
            courseId: course.id.toString(),
            lessonId: item.id.toString(),
            lessonTitle: item.title,
            youtubeId: item.youtubeId || course.youtubeId,
        })
        window.history.replaceState(null, '', `/course-watch?${newParams.toString()}`)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="px-4 py-10 mx-auto max-w-5xl text-center text-slate-600">
                    강의 정보를 불러오는 중입니다...
                </div>
            </div>
        )
    }

    if (!course || !selectedLesson || errorMessage) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="px-4 py-10 mx-auto max-w-5xl text-center">
                    <p className="mb-4 text-lg font-semibold text-slate-700">
                        {errorMessage ?? '강의를 찾을 수 없습니다.'}
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="px-4 py-8 mx-auto max-w-7xl">
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        ← 돌아가기
                    </button>
                </div>

                <div className="mb-4">
                    <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
                    <p className="text-sm text-slate-600">강의 ID: {selectedLessonId}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div>
                        <div className="relative overflow-hidden bg-black rounded-lg aspect-video">
                            <iframe
                                title={selectedLesson.title}
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&rel=0`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        <div className="p-4 mt-6 rounded-lg bg-slate-50 text-slate-700">
                            <p>선택된 강의를 바로 시청합니다. 문제가 발생하면 다른 강의를 선택해보세요.</p>
                            {currentEnrolledCourse && (
                                <button
                                    onClick={() => {
                                        const totalLessons = course.curriculum.reduce(
                                            (sum, section) => sum + section.items.length,
                                            0
                                        )
                                        completeLesson(course.id, selectedLessonId, totalLessons)
                                    }}
                                    disabled={isCompleted}
                                    className={`mt-4 px-4 py-2 rounded ${
                                        isCompleted
                                            ? 'bg-green-500 text-white cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {isCompleted ? '✅ 완료됨' : '완료 표시'}
                                </button>
                            )}
                        </div>
                    </div>

                    <aside className="p-4 border rounded-lg bg-slate-50">
                        <h2 className="mb-4 text-xl font-bold">커리큘럼</h2>
                        <div className="space-y-3">
                            {course.curriculum.map((section) => (
                                <div key={section.title}>
                                    <h3 className="mb-2 text-sm font-semibold text-slate-700">{section.title}</h3>
                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const active = item.id === selectedLessonId
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => updateLesson(item)}
                                                    className={`w-full text-left px-2 py-2 rounded ${
                                                        active
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {currentEnrolledCourse?.completedLessons?.includes(item.id) && (
                                                                <span className="text-green-600">✅</span>
                                                            )}
                                                            <span className="text-sm font-medium">{item.title}</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{item.duration}</span>
                                                    </div>
                                                    {item.isPreview && (
                                                        <span className="text-xs text-blue-600">미리보기</span>
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

export default CourseWatch

import { useEffect, useState } from 'react'
import Header from '../widgets/Header'
import { useAuth } from '../features/useAuth'
import {
    createInstructorLecture,
    createInstructorLesson,
    createInstructorSection,
    deleteInstructorLesson,
    deleteInstructorSection,
    getInstructorLecture,
    moveInstructorLessonDown,
    moveInstructorLessonUp,
    moveInstructorSectionDown,
    moveInstructorSectionUp,
    syncInstructorLectureDurations,
    updateInstructorLecture,
    updateInstructorLesson,
    updateInstructorSection,
    uploadThumbnail,
    type ApiLectureDetail,
    type ApiLectureSection,
    type ApiLectureVideo,
    type InstructorLecturePayload,
} from '../shared/api/lectures'
import { CATEGORIES } from '../shared/categories'

const DIFFICULTY_OPTIONS = ['입문', '초급', '중급 이상']

const parseLines = (value: string) =>
    value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)

const toTextarea = (values?: string[] | null) => (values ?? []).join('\n')

const getLectureIdFromPath = () => {
    const match = window.location.pathname.match(/^\/instructor\/lectures\/(\d+)$/)
    return match ? Number(match[1]) : null
}

const InstructorLectureEditor = () => {
    const { isAuthenticated, user } = useAuth()
    const lectureId = getLectureIdFromPath()
    const isCreateMode = lectureId === null

    const [lecture, setLecture] = useState<ApiLectureDetail | null>(null)
    const [isLoading, setIsLoading] = useState(!isCreateMode)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [form, setForm] = useState({
        title: '',
        description: '',
        descriptionDetail: '',
        mainCategory: '',
        category: '',
        difficulty: '',
        price: '0',
        thumbnail: '',
        learningGoals: '',
        prerequisites: '',
        includes: '',
    })

    const applyLecture = (data: ApiLectureDetail) => {
        setLecture(data)
        const subCat = data.tags?.[0]?.name ?? ''
        const mainCat = CATEGORIES.find(c => c.subs.includes(subCat))?.title ?? ''
        setForm({
            title: data.title ?? '',
            description: data.description ?? '',
            descriptionDetail: data.descriptionDetail ?? '',
            mainCategory: mainCat,
            category: subCat,
            difficulty: data.level ?? '',
            price: String(data.price ?? 0),
            thumbnail: data.thumbnail ?? '',
            learningGoals: toTextarea(data.learningGoals),
            prerequisites: toTextarea(data.prerequisites),
            includes: toTextarea(data.includes),
        })
    }

    const loadLecture = async () => {
        if (!lectureId) return
        setIsLoading(true)
        setErrorMessage('')
        try {
            const data = await getInstructorLecture(lectureId)
            applyLecture(data)
        } catch (error) {
            console.error(error)
            setErrorMessage('강의 정보를 불러오지 못했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated || user?.type !== 'instructor' || isCreateMode) {
            setIsLoading(false)
            return
        }
        loadLecture()
    }, [isAuthenticated, user?.type, lectureId])

    const buildPayload = (): InstructorLecturePayload => ({
        title: form.title.trim(),
        description: form.description.trim(),
        descriptionDetail: form.descriptionDetail.trim(),
        category: form.category.trim(),
        difficulty: form.difficulty.trim(),
        price: Number(form.price) || 0,
        thumbnail: form.thumbnail.trim(),
        learningGoals: parseLines(form.learningGoals),
        prerequisites: parseLines(form.prerequisites),
        includes: parseLines(form.includes),
    })

    const saveLecture = async () => {
        if (!form.title.trim()) {
            alert('강의 제목을 입력해주세요.')
            return
        }

        setIsSaving(true)
        try {
            const payload = buildPayload()
            const saved = isCreateMode
                ? await createInstructorLecture(payload)
                : await updateInstructorLecture(lectureId!, payload)

            applyLecture(saved)
            if (isCreateMode) {
                window.location.href = `/instructor/lectures/${saved.id}`
                return
            }

            alert('저장되었습니다.')
        } catch (error) {
            console.error(error)
            alert('저장에 실패했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const createSection = async () => {
        if (!lecture?.id) {
            alert('먼저 강의를 저장해주세요.')
            return
        }
        const title = window.prompt('새 섹션 제목을 입력하세요.')
        if (!title?.trim()) return

        await createInstructorSection(lecture.id, { title: title.trim() })
        await loadLecture()
    }

    const editSection = async (section: ApiLectureSection) => {
        const title = window.prompt('섹션 제목 수정', section.title)
        if (!title?.trim()) return
        await updateInstructorSection(section.id, { title: title.trim() })
        await loadLecture()
    }

    const createLesson = async (section: ApiLectureSection) => {
        const title = window.prompt('레슨 제목을 입력하세요.')
        if (!title?.trim()) return

        const youtubeId = window.prompt('YouTube ID를 입력하세요.', '') ?? ''
        const isPreview = window.confirm('미리보기 레슨으로 등록할까요?')

        await createInstructorLesson(section.id, {
            title: title.trim(),
            youtubeId: youtubeId.trim(),
            durationSec: 1,
            isPreview,
        })
        // YouTube ID로 영상 길이 자동 동기화
        if (lecture?.id) await syncInstructorLectureDurations(lecture.id)
        await loadLecture()
    }

    const editLesson = async (lesson: ApiLectureVideo) => {
        const title = window.prompt('레슨 제목 수정', lesson.title)
        if (!title?.trim()) return

        const youtubeId = window.prompt('YouTube ID 수정', lesson.youtubeId ?? '') ?? ''
        const isPreview = window.confirm(`현재 ${lesson.isPreview ? '미리보기' : '일반'} 레슨입니다. 확인을 누르면 미리보기 레슨으로 저장합니다.`)

        await updateInstructorLesson(lesson.id, {
            title: title.trim(),
            youtubeId: youtubeId.trim(),
            durationSec: lesson.durationSec,
            isPreview,
        })
        // YouTube ID 변경 시 영상 길이 자동 동기화
        if (lecture?.id) await syncInstructorLectureDurations(lecture.id)
        await loadLecture()
    }

    const subCategoryOptions = CATEGORIES.find(c => c.title === form.mainCategory)?.subs ?? []

    if (!isAuthenticated || user?.type !== 'instructor') {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="max-w-4xl px-4 py-16 mx-auto text-center">
                    <h1 className="text-2xl font-bold text-slate-900">강사 전용 화면입니다.</h1>
                    <p className="mt-3 text-slate-600">강사 계정으로 로그인해야 강의를 수정할 수 있습니다.</p>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="max-w-5xl px-4 py-16 mx-auto text-center text-slate-500">
                    강의 정보를 불러오는 중입니다...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <main className="max-w-6xl px-4 py-10 mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <a href="/instructor/lectures" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                            목록으로
                        </a>
                        <h1 className="mt-3 text-3xl font-bold">
                            {isCreateMode ? '새 강의 만들기' : '강의 편집'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {lecture?.id && (
                            <a
                                href={`/instructor/lectures/${lecture.id}/enrollments`}
                                className="px-4 py-3 font-semibold border rounded-2xl border-slate-300 hover:bg-white"
                            >
                                수강생 조회
                            </a>
                        )}
                        <button
                            onClick={saveLecture}
                            disabled={isSaving}
                            className="px-5 py-3 font-semibold text-white rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60"
                        >
                            {isSaving ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="p-4 mt-6 text-sm border rounded-2xl border-rose-200 bg-rose-50 text-rose-700">
                        {errorMessage}
                    </div>
                )}

                <section className="grid gap-6 mt-8 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
                        <h2 className="text-xl font-bold">기본 정보</h2>
                        <div className="grid gap-4 mt-6 md:grid-cols-2">
                            <label className="block md:col-span-2">
                                <span className="text-sm font-semibold text-slate-700">강의 제목</span>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 mt-2 border rounded-2xl border-slate-300"
                                />
                            </label>

                            {/* 카테고리 */}
                            <div className="block md:col-span-2">
                                <span className="text-sm font-semibold text-slate-700">카테고리</span>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select
                                        value={form.mainCategory}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                mainCategory: e.target.value,
                                                category: '',
                                            }))
                                        }
                                        className="w-full px-4 py-3 border rounded-2xl border-slate-300 bg-white"
                                    >
                                        <option value="">대분류 선택</option>
                                        {CATEGORIES.filter((c) => c.id !== 0).map((c) => (
                                            <option key={c.id} value={c.title}>
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, category: e.target.value }))
                                        }
                                        disabled={!form.mainCategory}
                                        className="w-full px-4 py-3 border rounded-2xl border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                                    >
                                        <option value="">세부 카테고리 선택</option>
                                        {subCategoryOptions.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 난이도 */}
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700">난이도</span>
                                <select
                                    value={form.difficulty}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, difficulty: e.target.value }))
                                    }
                                    className="w-full px-4 py-3 mt-2 border rounded-2xl border-slate-300 bg-white"
                                >
                                    <option value="">선택</option>
                                    {DIFFICULTY_OPTIONS.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700">가격</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.price}
                                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                                    className="w-full px-4 py-3 mt-2 border rounded-2xl border-slate-300"
                                />
                            </label>

                            <div className="block md:col-span-2">
                                <span className="text-sm font-semibold text-slate-700">썸네일</span>
                                <div className="flex gap-3 mt-2">
                                    {form.thumbnail && (
                                        <img
                                            src={form.thumbnail}
                                            alt="썸네일 미리보기"
                                            className="object-cover w-24 h-16 border rounded-xl border-slate-200 shrink-0"
                                        />
                                    )}
                                    <div className="flex flex-col flex-1 gap-2">
                                        <input
                                            value={form.thumbnail}
                                            onChange={(e) => setForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
                                            placeholder="이미지 URL 직접 입력"
                                            className="w-full px-4 py-3 border rounded-2xl border-slate-300"
                                        />
                                        <label className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold border rounded-2xl cursor-pointer border-slate-300 hover:bg-slate-50 ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                                                <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                                                <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                                            </svg>
                                            {isUploading ? '업로드 중...' : '이미지 파일 선택'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (!file) return
                                                    setIsUploading(true)
                                                    try {
                                                        const url = await uploadThumbnail(file)
                                                        setForm((prev) => ({ ...prev, thumbnail: url }))
                                                    } catch {
                                                        alert('이미지 업로드에 실패했습니다.')
                                                    } finally {
                                                        setIsUploading(false)
                                                        e.target.value = ''
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <label className="block md:col-span-2">
                                <span className="text-sm font-semibold text-slate-700">짧은 설명</span>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-3 mt-2 border rounded-2xl border-slate-300"
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-sm font-semibold text-slate-700">상세 소개</span>
                                <textarea
                                    value={form.descriptionDetail}
                                    onChange={(e) => setForm((prev) => ({ ...prev, descriptionDetail: e.target.value }))}
                                    rows={5}
                                    className="w-full px-4 py-3 mt-2 border rounded-2xl border-slate-300"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
                        <h2 className="text-xl font-bold">강의 소개 항목</h2>
                        <p className="mt-2 text-sm text-slate-500">한 줄에 하나씩 입력하면 배열로 저장됩니다.</p>
                        <label className="block mt-5">
                            <span className="text-sm font-semibold text-slate-700">학습 목표</span>
                            <textarea
                                value={form.learningGoals}
                                onChange={(e) => setForm((prev) => ({ ...prev, learningGoals: e.target.value }))}
                                rows={5}
                                className="w-full px-4 py-3 mt-2 border rounded-2xl border-slate-300"
                            />
                        </label>
                        <label className="block mt-5">
                            <span className="text-sm font-semibold text-slate-700">선수 지식</span>
                            <textarea
                                value={form.prerequisites}
                                onChange={(e) => setForm((prev) => ({ ...prev, prerequisites: e.target.value }))}
                                rows={5}
                                className="w-full px-4 py-3 mt-2 border rounded-2xl border-slate-300"
                            />
                        </label>
                        <label className="block mt-5">
                            <span className="text-sm font-semibold text-slate-700">포함 사항</span>
                            <textarea
                                value={form.includes}
                                onChange={(e) => setForm((prev) => ({ ...prev, includes: e.target.value }))}
                                rows={5}
                                className="w-full px-4 py-3 mt-2 border rounded-2xl border-slate-300"
                            />
                        </label>
                    </div>
                </section>

                <section className="p-6 mt-8 bg-white border shadow-sm rounded-3xl border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold">커리큘럼</h2>
                            <p className="mt-2 text-sm text-slate-500">섹션과 레슨은 정렬 순서를 1부터 유지합니다.</p>
                        </div>
                        <button
                            onClick={createSection}
                            className="px-4 py-3 font-semibold border rounded-2xl border-slate-300 hover:bg-slate-50"
                        >
                            섹션 추가
                        </button>
                    </div>

                    {!lecture?.id ? (
                        <div className="p-6 mt-6 text-sm border rounded-2xl border-amber-200 bg-amber-50 text-amber-800">
                            먼저 강의를 저장해야 커리큘럼을 관리할 수 있습니다.
                        </div>
                    ) : lecture.sections.length === 0 ? (
                        <div className="p-6 mt-6 text-sm text-center rounded-2xl bg-slate-50 text-slate-500">
                            아직 섹션이 없습니다.
                        </div>
                    ) : (
                        <div className="mt-6 border divide-y rounded-3xl border-slate-200 divide-slate-200">
                            {lecture.sections.map((section) => (
                                <div key={section.id} className="p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold tracking-wide text-slate-500">SECTION {section.order}</p>
                                            <h3 className="mt-1 text-lg font-bold">{section.title}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => moveInstructorSectionUp(section.id).then(loadLecture)} className="px-3 py-2 text-sm border rounded-xl border-slate-300 hover:bg-slate-50">위로</button>
                                            <button onClick={() => moveInstructorSectionDown(section.id).then(loadLecture)} className="px-3 py-2 text-sm border rounded-xl border-slate-300 hover:bg-slate-50">아래로</button>
                                            <button onClick={() => editSection(section).catch((error) => { console.error(error); alert('섹션 수정에 실패했습니다.') })} className="px-3 py-2 text-sm border rounded-xl border-slate-300 hover:bg-slate-50">수정</button>
                                            <button onClick={() => createLesson(section).catch((error) => { console.error(error); alert('레슨 추가에 실패했습니다.') })} className="px-3 py-2 text-sm font-semibold text-white rounded-xl bg-slate-900 hover:bg-slate-700">레슨 추가</button>
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('이 섹션을 삭제할까요?')) return
                                                    try {
                                                        await deleteInstructorSection(section.id)
                                                        await loadLecture()
                                                    } catch (error) {
                                                        console.error(error)
                                                        alert('진도 데이터가 있는 섹션은 삭제할 수 없습니다.')
                                                    }
                                                }}
                                                className="px-3 py-2 text-sm border rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-5">
                                        {section.videos.length === 0 ? (
                                            <div className="p-4 text-sm text-center rounded-2xl bg-slate-50 text-slate-500">
                                                아직 레슨이 없습니다.
                                            </div>
                                        ) : section.videos.map((lesson) => (
                                            <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50">
                                                <div>
                                                    <div className="font-semibold">{lesson.order}. {lesson.title}</div>
                                                    <div className="mt-1 text-sm text-slate-500">
                                                        {lesson.youtubeId ?? 'YouTube ID 없음'} · {lesson.durationSec}초 · {lesson.isPreview ? '미리보기' : '일반'}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button onClick={() => moveInstructorLessonUp(lesson.id).then(loadLecture)} className="px-3 py-2 text-sm border rounded-xl border-slate-300 hover:bg-white">위로</button>
                                                    <button onClick={() => moveInstructorLessonDown(lesson.id).then(loadLecture)} className="px-3 py-2 text-sm border rounded-xl border-slate-300 hover:bg-white">아래로</button>
                                                    <button onClick={() => editLesson(lesson).catch((error) => { console.error(error); alert('레슨 수정에 실패했습니다.') })} className="px-3 py-2 text-sm border rounded-xl border-slate-300 hover:bg-white">수정</button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!window.confirm('이 레슨을 삭제할까요?')) return
                                                            try {
                                                                await deleteInstructorLesson(lesson.id)
                                                                await loadLecture()
                                                            } catch (error) {
                                                                console.error(error)
                                                                alert('진도 데이터가 있는 레슨은 삭제할 수 없습니다.')
                                                            }
                                                        }}
                                                        className="px-3 py-2 text-sm border rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="p-6 mt-8 bg-white border shadow-sm rounded-3xl border-slate-200">
                    <h2 className="text-xl font-bold">후기 조회</h2>
                    {!lecture?.reviews?.length ? (
                        <div className="p-6 mt-6 text-sm text-center rounded-2xl bg-slate-50 text-slate-500">
                            아직 등록된 후기가 없습니다.
                        </div>
                    ) : (
                        <div className="grid gap-4 mt-6 md:grid-cols-2">
                            {lecture.reviews.map((review) => (
                                <article key={review.id} className="p-5 border rounded-2xl border-slate-200">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="font-semibold">{review.user?.name ?? '익명'}</div>
                                        <div className="text-sm text-amber-600">평점 {review.rating}/5</div>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-slate-700">{review.comment}</p>
                                    <div className="mt-3 text-xs text-slate-500">
                                        {new Date(review.createdAt).toLocaleString('ko-KR')}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default InstructorLectureEditor

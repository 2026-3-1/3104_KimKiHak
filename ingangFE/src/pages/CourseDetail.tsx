import { useState } from 'react'
import Header from '../widgets/Header'
import CourseDetailHero from '../widgets/CourseDetailHero'
import CourseCurriculum from '../widgets/CourseCurriculum'
import CourseReview from '../widgets/CourseReview'
import SectionTabs from '../widgets/SectionTabs'
import { buildCourseWatchUrl } from '../shared/utils/course'
import { useCourseDetail } from '../features/useCourseDetail'
import { useAuth } from '../features/useAuth'
import { useMyCourses } from '../features/useMyCourses'
import { useCart } from '../features/useCart'
import type { CurriculumItem } from '../types/course'

const CourseDetail = () => {
    const params = new URLSearchParams(window.location.search)
    const courseId = Number(params.get('id') || params.get('courseId'))

    const { course, reviews, setReviews, isLoading, errorMessage } = useCourseDetail(courseId)
    const { isAuthenticated, user, openModal } = useAuth()
    const { enrollCourse, isEnrolled, enrolledCourses } = useMyCourses()
    const { isInCart, addItem: addToCart } = useCart(user?.id ?? null)
    const [activeTab, setActiveTab] = useState<'intro' | 'curriculum' | 'reviews'>('intro')
    const [cartMsg, setCartMsg] = useState('')

    const enrolledCourse = course ? enrolledCourses.find((item) => item.id === course.id) : undefined
    const courseIsEnrolled = course ? isEnrolled(course.id) : false
    const courseIsInCart = course ? isInCart(course.id) : false

    const openLesson = (item: CurriculumItem) => {
        if (!course) return
        window.location.href = buildCourseWatchUrl(course.id, item.id, item.youtubeId ?? course.youtubeId)
    }

    const handleStartWatching = () => {
        if (!course) return

        // 마지막으로 시청한 강의 위치에서 이어보기
        if (enrolledCourse?.lastWatchedLessonId) {
            const lessonId = enrolledCourse.lastWatchedLessonId
            const startSeconds = enrolledCourse.lessonProgress[lessonId] ?? 0
            const found = course.curriculum.flatMap((s) => s.items).find((i) => i.id === lessonId)
            if (found) {
                window.location.href = buildCourseWatchUrl(
                    course.id, lessonId, found.youtubeId ?? course.youtubeId, startSeconds,
                )
                return
            }
        }

        // 처음 시청
        const firstLesson = course.curriculum[0]?.items[0]
        if (firstLesson) openLesson(firstLesson)
    }

    const handleEnroll = async () => {
        if (!course) return
        try {
            await enrollCourse({
                id: course.id,
                title: course.title,
                instructor: course.instructor,
                thumbnail: course.thumbnail,
                lessonProgress: {},
                lastWatchedLessonId: null,
            })
        } catch (err) {
            console.error('수강신청 실패:', err)
            alert('수강신청에 실패했습니다. 다시 시도해주세요.')
            return
        }
        setActiveTab('curriculum')
    }

    const handleAddToCart = async () => {
        if (!course || !user) return
        try {
            await addToCart(course.id)
            setCartMsg('장바구니에 추가되었습니다!')
            setTimeout(() => setCartMsg(''), 3000)
        } catch {
            setCartMsg('장바구니 추가 실패. 다시 시도해주세요.')
            setTimeout(() => setCartMsg(''), 3000)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-5xl px-4 py-10 mx-auto text-center text-slate-600">
                    강의 정보를 불러오는 중입니다...
                </div>
            </div>
        )
    }

    if (!course || errorMessage) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-5xl px-4 py-10 mx-auto text-center">
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
            <CourseDetailHero
                course={course}
                isAuthenticated={isAuthenticated}
                isEnrolled={courseIsEnrolled}
                isInCart={courseIsInCart}
                onEnroll={handleEnroll}
                onStartWatching={handleStartWatching}
                onOpenModal={openModal}
                onAddToCart={handleAddToCart}
            />

            {/* 장바구니 토스트 메시지 */}
            {cartMsg && (
                <div className="fixed z-50 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-lg bottom-6 right-6 bg-slate-800">
                    {cartMsg}
                </div>
            )}

            <SectionTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="px-4 py-8 mx-auto max-w-7xl">
                {activeTab === 'intro' && (
                    <div className="prose max-w-none">
                        <h2 className="mb-6 text-2xl font-bold">강의 소개</h2>
                        <p className="mb-8 text-lg leading-relaxed text-slate-700">
                            {course.description}
                        </p>
                        <div className="grid gap-6 mb-8 md:grid-cols-3">
                            <div className="p-6 rounded-lg bg-slate-50">
                                <h3 className="mb-2 font-semibold">학습 목표</h3>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    {(course.learningGoals ?? ['실제 현장 강의 내용을 이해합니다.', '안전 수칙과 표준 절차를 습득합니다.', '공정별 실무 적용 능력을 키웁니다.']).map((goal) => (
                                        <li key={goal}>• {goal}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6 rounded-lg bg-slate-50">
                                <h3 className="mb-2 font-semibold">선수 지식</h3>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    {(course.prerequisites ?? ['기본적인 현장 규칙 이해', '기본적인 도구 사용법 지식', '안전 의식']).map((item) => (
                                        <li key={item}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6 rounded-lg bg-slate-50">
                                <h3 className="mb-2 font-semibold">포함 사항</h3>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    {(course.includes ?? ['강의 영상 제공', '실습 예제 소개', '수료 체크리스트']).map((item) => (
                                        <li key={item}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <CourseCurriculum
                        course={course}
                        enrolledCourse={enrolledCourse}
                        isEnrolled={courseIsEnrolled}
                        onOpenLesson={openLesson}
                    />
                )}

                {activeTab === 'reviews' && (
                    <CourseReview courseId={course.id} reviews={reviews} onSave={setReviews} />
                )}
            </div>
        </div>
    )
}

export default CourseDetail

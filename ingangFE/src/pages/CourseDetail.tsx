import { useEffect, useState } from 'react'
import Header from '../widgets/Header'
import { useAuth } from '../features/useAuth'
import { useMyCourses } from '../features/useMyCourses'
import CourseReview from '../features/CourseReview'
import { getLecture } from '../shared/api/lectures'

type CurriculumItem = {
    id: number
    title: string
    duration: string
    youtubeId?: string
    isPreview?: boolean
}

type CurriculumSection = {
    id: number
    title: string
    items: CurriculumItem[]
}

type Course = {
    id: number
    title: string
    instructor: string
    description: string
    youtubeId: string
    thumbnail: string
    level: string
    tags: string[]
    curriculum: CurriculumSection[]
    reviews: {
        author: string
        rating: number
        comment: string
        createdAt: string
    }[]
}

const CourseDetail = () => {
    const [course, setCourse] = useState<Course | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'intro' | 'curriculum' | 'reviews'>('intro')

    const { isAuthenticated, openModal } = useAuth()
    const { enrollCourse, isEnrolled, enrolledCourses } = useMyCourses()
    const [reviews, setReviews] = useState<Course['reviews']>([])

    const currentEnrolledCourse = enrolledCourses.find(c => c.id === course?.id)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const idParam = params.get('id') || params.get('courseId')
        const courseId = Number(idParam)

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

                const mapped: Course = {
                    id: lecture.id,
                    title: lecture.title,
                    instructor: lecture.instructor?.name ?? '알 수 없음',
                    description: lecture.description ?? '',
                    youtubeId: primaryYoutubeId,
                    thumbnail:
                        lecture.thumbnail ??
                        (primaryYoutubeId
                            ? `https://img.youtube.com/vi/${primaryYoutubeId}/hqdefault.jpg`
                            : 'https://img.youtube.com/vi/default.jpg'),
                    level: lecture.level ?? '입문',
                    tags: lecture.tags?.map(tag => tag.name) ?? [],
                    curriculum,
                    reviews: lecture.reviews.map(review => ({
                        author: review.user?.name ?? '익명',
                        rating: review.rating,
                        comment: review.comment,
                        createdAt: new Date(review.createdAt).toLocaleDateString('ko-KR'),
                    })),
                }

                setCourse(mapped)
                setReviews(mapped.reviews)
            } catch (error) {
                console.error(error)
                setErrorMessage('강의 정보를 불러오지 못했습니다.')
            } finally {
                setIsLoading(false)
            }
        }

        loadCourse()
    }, [])


    const openLesson = (item: CurriculumItem) => {
        if (!course) return
        const search = new URLSearchParams({
            courseId: course.id.toString(),
            lessonId: item.id.toString(),
            lessonTitle: item.title,
            youtubeId: item.youtubeId || course.youtubeId,
        })
        window.location.href = `/course-watch?${search.toString()}`
    }

    const totalDuration = course?.curriculum.reduce((total, section) => {
        return total + section.items.reduce((sectionTotal, item) => {
            const [minutes, seconds] = item.duration.split(':').map(Number)
            return sectionTotal + minutes * 60 + seconds
        }, 0)
    }, 0)

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) {
            return `${hours}시간 ${minutes}분`
        }
        return `${minutes}분`
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

    if (!course || errorMessage) {
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
            {/* 헤더 섹션 */}
            <div className="text-white bg-slate-900">
                <div className="px-4 py-8 mx-auto max-w-7xl">
                    <div className="grid items-center gap-8 md:grid-cols-2">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {course.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 text-sm rounded bg-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="mb-4 text-3xl font-bold">{course.title}</h1>
                            <p className="mb-4 text-slate-300">{course.instructor}</p>
                            <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                                <span>난이도: {course.level}</span>
                                <span>총 {course.curriculum.reduce((sum, s) => sum + s.items.length, 0)}강</span>
                                <span>{formatDuration(totalDuration)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {isAuthenticated ? (
                                    isEnrolled(course.id) ? (
                                        <button
                                            onClick={() => window.location.href = `/course-watch?courseId=${course.id}&lessonId=${course.curriculum[0].items[0].id}&youtubeId=${course.youtubeId}`}
                                            className="px-8 py-3 text-lg font-semibold bg-green-600 rounded-lg hover:bg-green-700"
                                        >
                                            강의 이어서 보기
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                enrollCourse({
                                                    id: course.id,
                                                    title: course.title,
                                                    instructor: course.instructor,
                                                    thumbnail: course.thumbnail
                                                })
                                                window.location.href = `/course-watch?courseId=${course.id}&lessonId=${course.curriculum[0].items[0].id}&youtubeId=${course.youtubeId}`
                                            }}
                                            className="px-8 py-3 text-lg font-semibold bg-blue-600 rounded-lg hover:bg-blue-700"
                                        >
                                            수강신청
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={openModal}
                                        className="px-8 py-3 text-lg font-semibold bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        로그인 후 수강신청
                                    </button>
                                )}  
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-lg aspect-video bg-slate-800">
                            <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="sticky top-0 z-10 bg-white border-b">
                <div className="px-4 mx-auto max-w-7xl">
                    <nav className="flex">
                        {[
                            { id: 'intro', label: '강의 소개' },
                            { id: 'curriculum', label: '커리큘럼' },
                            { id: 'reviews', label: '후기' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'intro' | 'curriculum' | 'reviews')}
                                className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* 컨텐츠 섹션 */}
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
                                    <li>• React 기초부터 고급까지 완전 정복</li>
                                    <li>• 실무 프로젝트 개발 경험</li>
                                    <li>• 최신 React 패턴 적용</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-lg bg-slate-50">
                                <h3 className="mb-2 font-semibold">선수 지식</h3>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    <li>• HTML/CSS 기본</li>
                                    <li>• JavaScript 기초</li>
                                    <li>• 프로그래밍 기본 개념</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-lg bg-slate-50">
                                <h3 className="mb-2 font-semibold">포함 사항</h3>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    <li>• 12개 강의 영상</li>
                                    <li>• 소스코드 제공</li>
                                    <li>• 수강 기간 무제한</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div>
                        <h2 className="mb-6 text-2xl font-bold">커리큘럼</h2>
                        <div className="space-y-6">
                            {course.curriculum.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="overflow-hidden border rounded-lg">
                                    <div className="px-6 py-4 border-b bg-slate-50">
                                        <h3 className="text-lg font-semibold">{section.title}</h3>
                                        <p className="text-sm text-slate-600">
                                            {section.items.length}강 · {formatDuration(
                                                section.items.reduce((total, item) => {
                                                    const [min, sec] = item.duration.split(':').map(Number)
                                                    return total + min * 60 + sec
                                                }, 0)
                                            )}
                                        </p>
                                    </div>
                                    <div className="divide-y">
                                        {section.items.map((item) => {
                                            const canWatch = item.isPreview || isEnrolled(course.id)
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={canWatch ? () => openLesson(item) : undefined}
                                                    className={`flex items-center justify-between w-full px-6 py-4 text-left ${
                                                        canWatch ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-not-allowed opacity-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {currentEnrolledCourse?.completedLessons?.includes(item.id) && (
                                                            <span className="text-green-600">✅</span>
                                                        )}
                                                        {item.isPreview && (
                                                            <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                                                                미리보기
                                                            </span>
                                                        )}
                                                        <span className="font-medium">{item.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                                        <span>{item.duration}</span>
                                                        {canWatch ? (
                                                            <span className="text-blue-600 hover:text-blue-800">
                                                                ▶️ 재생
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                🔒 잠김
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <CourseReview courseId={course.id} reviews={reviews} onSave={setReviews} />
                )}
            </div>
        </div>
    )
}

export default CourseDetail

import { useState } from 'react'
import Header from '../widgets/Header'
import { useAuth } from '../features/useAuth'
import { useMyCourses } from '../features/useMyCourses'
import CourseReview from '../features/CourseReview'

type CurriculumItem = {
    id: number
    title: string
    duration: string
    youtubeId?: string
    isPreview?: boolean
}

type CurriculumSection = {
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

export const SAMPLE_COURSE: Course = {
    id: 1,
    title: '프론트엔드 실전 React 강좌',
    instructor: '강사 김코딩',
    description: 'React 기초부터 실무 프로젝트까지 한 번에 학습합니다. 최신 React 18 버전을 사용하며, TypeScript와 함께 실전적인 웹 애플리케이션을 개발하는 방법을 배웁니다.',
    youtubeId: 'Ke90Tje7VS0',
    thumbnail: 'https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg',
    level: '중급',
    tags: ['React', 'TypeScript', '웹개발', '프론트엔드'],
    curriculum: [
        {
            title: 'React 기초',
            items: [
                { id: 1, title: 'React 소개 및 설치', duration: '15:30', youtubeId: 'Ke90Tje7VS0', isPreview: true },
                { id: 2, title: 'JSX와 컴포넌트', duration: '22:45', youtubeId: 'dQw4w9WgXcQ' },
                { id: 3, title: 'Props와 State', duration: '28:10', youtubeId: '9bZkp7q19f0' },
                { id: 4, title: '이벤트 처리', duration: '19:55', youtubeId: 'hTWKbfoikeg' },
            ]
        },
        {
            title: '고급 React',
            items: [
                { id: 5, title: 'Hooks 사용하기', duration: '35:20', youtubeId: 'dpw9EHDh2bM' },
                { id: 6, title: 'Context API', duration: '25:40', youtubeId: '5LrDIWkK_Bc' },
                { id: 7, title: 'React Router', duration: '30:15', youtubeId: '4sosXZsCCWQ' },
                { id: 8, title: '성능 최적화', duration: '27:50', youtubeId: 'aVhdasj8oL8' },
            ]
        },
        {
            title: '실전 프로젝트',
            items: [
                { id: 9, title: '프로젝트 기획', duration: '18:30', youtubeId: 'fJ9rUzIMcZQ' },
                { id: 10, title: '컴포넌트 설계', duration: '40:20', youtubeId: 'YLgBvRsXtlM' },
                { id: 11, title: 'API 연동', duration: '45:10', youtubeId: '4UZrsTqkc8E' },
                { id: 12, title: '배포하기', duration: '20:05', youtubeId: 'hQjlM-8C4Ps' },
            ]
        }
    ],
    reviews: [
        {
            author: '학생A',
            rating: 5,
            comment: '정말 좋은 강의입니다. 실무에 바로 적용할 수 있어요!',
            createdAt: '2024-01-15'
        },
        {
            author: '학생B',
            rating: 4,
            comment: '설명이 자세하고 예제가 많아서 좋았습니다.',
            createdAt: '2024-01-10'
        }
    ]
}

const CourseDetail = () => {
    const course = SAMPLE_COURSE
    const [activeTab, setActiveTab] = useState<'intro' | 'curriculum' | 'reviews'>('intro')

    const { isAuthenticated, openModal } = useAuth()
    const { enrollCourse, isEnrolled, enrolledCourses } = useMyCourses()
    const [reviews, setReviews] = useState(course.reviews)

    const currentEnrolledCourse = enrolledCourses.find(c => c.id === course.id)


    const openLesson = (item: CurriculumItem) => {
        const search = new URLSearchParams({
            lessonId: item.id.toString(),
            lessonTitle: item.title,
            youtubeId: course.youtubeId,
        })
        window.location.href = `/course-watch?${search.toString()}`
    }

    const totalDuration = course.curriculum.reduce((total, section) => {
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
                                            onClick={() => window.location.href = `/course-watch?lessonId=${course.curriculum[0].items[0].id}&youtubeId=${course.youtubeId}`}
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
                                                window.location.href = `/course-watch?lessonId=${course.curriculum[0].items[0].id}&youtubeId=${course.youtubeId}`
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

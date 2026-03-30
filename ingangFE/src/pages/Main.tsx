import CategoryBar from '../shared/CategoryBar'
import { useAuth } from '../features/useAuth'
import MyCourses from '../features/MyCourses'
import { useState, useEffect } from 'react'
import { getLectures } from '../shared/api/lectures'

type Course = {
    id: number
    title: string
    instructor: string
    thumbnail: string
    level: string
    tags: string[]
    description?: string
}

const Main = () => {
    const { isAuthenticated } = useAuth()
    const [courses, setCourses] = useState<Course[]>([])
    const [searchResults, setSearchResults] = useState<Course[]>([])
    const [showResults, setShowResults] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        let isMounted = true

        const loadLectures = async () => {
            try {
                const lectures = await getLectures()
                if (!isMounted || lectures.length === 0) return

                const mapped: Course[] = lectures.map(lecture => {
                    const youtubeThumb = lecture.youtubeId
                        ? `https://img.youtube.com/vi/${lecture.youtubeId}/hqdefault.jpg`
                        : undefined

                    return {
                        id: lecture.id,
                        title: lecture.title,
                        instructor: lecture.instructor?.name ?? '알 수 없음',
                        thumbnail:
                            lecture.thumbnail ??
                            youtubeThumb ??
                            'https://img.youtube.com/vi/default.jpg',
                        level: lecture.level ?? '입문',
                        tags: lecture.tags?.map(tag => tag.name) ?? [],
                        description: lecture.description ?? undefined,
                    }
                })

                setCourses(mapped)
            } catch (error) {
                console.warn('강의 목록을 불러오지 못했습니다. 로컬 데이터로 대체합니다.', error)
            }
        }

        loadLectures()

        return () => {
            isMounted = false
        }
    }, [])

    // URL에서 검색어 파라미터 읽기
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const searchParam = urlParams.get('search')
        if (searchParam) {
            const query = decodeURIComponent(searchParam)
            setSearchQuery(query)
        }
    }, [])

    useEffect(() => {
        if (!searchQuery) return

        const normalized = searchQuery.toLowerCase()
        const results = courses.filter(course =>
            course.title.toLowerCase().includes(normalized) ||
            course.instructor.toLowerCase().includes(normalized) ||
            course.tags.some(tag => tag.toLowerCase().includes(normalized)) ||
            (course.description && course.description.toLowerCase().includes(normalized))
        )

        setSearchResults(results)
        setShowResults(true)
    }, [searchQuery, courses])

    const handleCourseClick = (courseId: number) => {
        window.location.href = `/course-detail?id=${courseId}`
    }

    const clearSearch = () => {
        setSearchResults([])
        setShowResults(false)
        setSearchQuery('')
        // URL에서 search 파라미터 제거
        const url = new URL(window.location.href)
        url.searchParams.delete('search')
        window.history.replaceState({}, '', url.pathname)
    }

    return (
        <main className="min-h-[70vh] bg-white text-slate-900">
            <section className="flex flex-col items-center px-4 pt-20 pb-24 mx-auto text-center max-w-7xl">
                <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    코딩을 {' '}
                    <span className="text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text">
                        쉽고 빠르게 {' '}
                    </span>
                    배우다
                </h1>
                <p className="mt-4 text-sm font-medium text-slate-600 sm:text-base">
                    오늘, 성장할 IT 카테고리를 고르세요
                </p>

                {/* 검색 결과 표시 */}
                {showResults && (
                    <div className="w-full max-w-6xl mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">
                                "{searchQuery}" 검색 결과 ({searchResults.length}개)
                            </h2>
                            <button
                                onClick={clearSearch}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                닫기 ✕
                            </button>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {searchResults.map(course => (
                                    <div
                                        key={course.id}
                                        onClick={() => handleCourseClick(course.id)}
                                        className="overflow-hidden transition-all duration-200 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-lg"
                                    >
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="object-cover w-full h-40"
                                        />
                                        <div className="p-4">
                                            <h3 className="mb-2 text-lg font-semibold line-clamp-2">
                                                {course.title}
                                            </h3>
                                            <p className="mb-2 text-sm text-gray-600">
                                                {course.instructor}
                                            </p>
                                            <p className="mb-3 text-sm text-gray-700 line-clamp-2">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                                                    {course.level}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {course.tags.slice(0, 2).map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="w-full py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded hover:bg-blue-700">
                                                강의 보기
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <div className="mb-4 text-4xl">🔍</div>
                                <p className="mb-2 text-lg">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
                                <p className="text-sm">다른 키워드로 검색해보세요.</p>
                            </div>
                        )}
                    </div>
                )}

                <CategoryBar />
            </section>

            {isAuthenticated && <MyCourses />}
        </main>
    )
}

export default Main;

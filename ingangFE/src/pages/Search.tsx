import { useEffect, useState } from 'react'
import { getLectures } from '../shared/api/lectures'
import type { Course } from '../types/course'
import { DIFFICULTY_LEVELS } from '../constants'
import LectureCard from '../shared/LectureCard'

const Search = () => {
    const [courses, setCourses] = useState<Course[]>([])
    const [searchResults, setSearchResults] = useState<Course[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

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
                        level: lecture.level ?? DIFFICULTY_LEVELS.BEGINNER,
                        tags: lecture.tags?.map(tag => tag.name) ?? [],
                        description: lecture.description ?? undefined,
                    }
                })

                setCourses(mapped)
            } catch (error) {
                console.warn('강의 목록을 불러오지 못했습니다. 로컬 데이터로 대체합니다.', error)
            } finally {
                if (isMounted) setIsLoading(false)
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
        if (!searchQuery) {
            setSearchResults([])
            return
        }

        const normalized = searchQuery.toLowerCase()
        const results = courses.filter(course =>
            course.title.toLowerCase().includes(normalized) ||
            course.instructor.toLowerCase().includes(normalized) ||
            course.tags.some(tag => tag.toLowerCase().includes(normalized)) ||
            (course.description && course.description.toLowerCase().includes(normalized))
        )

        setSearchResults(results)
    }, [searchQuery, courses])

    const handleCourseClick = (courseId: number) => {
        window.location.href = `/course-detail?id=${courseId}`
    }

    const clearSearch = () => {
        window.location.href = '/'
    }

    return (
        <main className="min-h-[70vh] bg-white text-slate-900">
            <section className="px-4 pt-16 pb-24 mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">검색 결과</h1>
                    <button
                        onClick={clearSearch}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        메인으로
                    </button>
                </div>

                {!searchQuery && (
                    <div className="py-16 text-center text-gray-500">
                        <div className="mb-4 text-4xl">(검색)</div>
                        <p className="mb-2 text-lg">검색어를 입력해보세요.</p>
                        <p className="text-sm">상단 검색창에서 키워드를 입력하면 결과가 표시됩니다.</p>
                    </div>
                )}

                {searchQuery && (
                    <>
                        <div className="mb-6 text-sm text-gray-500">
                            "{searchQuery}" 검색 결과 ({searchResults.length}개)
                        </div>

                        {isLoading ? (
                            <div className="py-16 text-center text-gray-500">검색 결과를 불러오는 중...</div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {searchResults.map(course => (
                                    <LectureCard
                                        key={course.id}
                                        course={course}
                                        onClick={() => handleCourseClick(course.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <div className="mb-4 text-4xl">(검색)</div>
                                <p className="mb-2 text-lg">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
                                <p className="text-sm">다른 키워드로 검색해보세요.</p>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    )
}

export default Search

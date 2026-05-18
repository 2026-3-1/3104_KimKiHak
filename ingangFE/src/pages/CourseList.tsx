import CategoryBar from '../shared/CategoryBar'
import Header from '../widgets/Header'
import { useEffect, useState } from 'react'
import { getLectures } from '../shared/api/lectures'
import type { Course } from '../types/course'
import { DIFFICULTY_LEVELS } from '../constants'
import LectureCard from '../shared/LectureCard'
import { getSubsForCategory } from '../shared/categories'

const CourseList = () => {
    const [category, setCategory] = useState<string | null>(null)
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const cat = new URLSearchParams(window.location.search).get('category') ?? ''
        setCategory(cat)

        const onPopState = () => {
            const c = new URLSearchParams(window.location.search).get('category') ?? ''
            setCategory(c)
        }
        window.addEventListener('popstate', onPopState)
        return () => window.removeEventListener('popstate', onPopState)
    }, [])

    useEffect(() => {
        if (category === null) return
        let isMounted = true

        const loadLectures = async () => {
            try {
                const mainSubs = getSubsForCategory(category)
                // 큰 카테고리 선택 시: 전체를 가져와서 세부 카테고리 태그로 클라이언트 필터링
                const raw = await getLectures(mainSubs ? undefined : category || undefined)
                const lectures = mainSubs?.length
                    ? raw.filter(l => l.tags?.some(t => mainSubs.includes(t.name)))
                    : raw
                if (!isMounted) return

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
                        tags: lecture.tags?.map(tag => tag.name) ?? [category],
                        description: lecture.description ?? undefined,
                    }
                })

                setCourses(mapped)
            } catch (error) {
                console.warn('강의 목록을 불러오지 못했습니다.', error)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        loadLectures()

        return () => {
            isMounted = false
        }
    }, [category])

    if (category === null) return <div>로딩 중...</div>

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <main className="px-4 pt-3 pb-20 mx-auto max-w-7xl">
                <section className="mt-10">
                    <CategoryBar
                        selectedCategory={category ?? ''}
                        onSelect={(cat) => {
                            setCategory(cat)
                            const url = cat ? `/courses?category=${encodeURIComponent(cat)}` : '/courses'
                            history.pushState(null, '', url)
                        }}
                    />
                </section>

                <section className="mt-12">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {category ? category : '전체'} 강의
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="px-3 py-1 text-xs font-semibold bg-white border rounded-full text-slate-700 border-slate-200">
                                난이도
                            </span>
                            <span className="px-3 py-1 text-xs font-semibold bg-white border rounded-full text-slate-700 border-slate-200">
                                인기순
                            </span>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="py-12 text-center text-slate-500">강의 목록을 불러오는 중...</div>
                    ) : courses.length > 0 ? (
                        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map(course => (
                                <LectureCard
                                    key={course.id}
                                    course={course}
                                    onClick={() => window.location.href = `/course-detail?id=${course.id}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-500">표시할 강의가 없습니다.</div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default CourseList

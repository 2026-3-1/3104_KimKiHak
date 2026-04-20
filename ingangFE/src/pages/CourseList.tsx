import CategoryBar from '../shared/CategoryBar'
import Header from '../widgets/Header'
import { useEffect, useState } from 'react'
import { getLectures } from '../shared/api/lectures'
import type { Course } from '../types/course'
import { DIFFICULTY_LEVELS } from '../constants'
import LectureCard from '../shared/LectureCard'

const CourseList = () => {
    const [category, setCategory] = useState<string>('')
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const cat = urlParams.get('category') || 'fe'
        setCategory(cat)
    }, [])

    useEffect(() => {
        if (!category) return
        let isMounted = true

        const loadLectures = async () => {
            try {
                const lectures = await getLectures(category)
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

    if (!category) return <div>로딩 중...</div>

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <main className="px-4 pt-3 pb-20 mx-auto max-w-7xl">
                <section className="mt-10">
                    <CategoryBar />
                </section>

                <section className="mt-12">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {category.toUpperCase()} 강의
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

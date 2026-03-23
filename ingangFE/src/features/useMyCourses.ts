import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

export interface EnrolledCourse {
    id: number
    title: string
    instructor: string
    thumbnail: string
    enrolledAt: string
    progress: number // 0-100
    completedLessons: number[] // 완료된 강의 ID 목록
}

const STORAGE_KEY = 'enrolled-courses'

export const useMyCourses = () => {
    const { user } = useAuth()
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`${STORAGE_KEY}-${user.id}`)
            if (saved) {
                try {
                    setEnrolledCourses(JSON.parse(saved))
                } catch (error) {
                    console.error('Failed to parse enrolled courses:', error)
                    setEnrolledCourses([])
                }
            }
        } else {
            setEnrolledCourses([])
        }
    }, [user])

    const enrollCourse = (course: Omit<EnrolledCourse, 'enrolledAt' | 'progress' | 'completedLessons'>) => {
        if (!user) return

        const newEnrolledCourse: EnrolledCourse = {
            ...course,
            enrolledAt: new Date().toISOString(),
            progress: 0,
            completedLessons: []
        }

        setEnrolledCourses(prev => {
            const updated = [newEnrolledCourse, ...prev]
            localStorage.setItem(`${STORAGE_KEY}-${user.id}`, JSON.stringify(updated))
            return updated
        })
    }

    const updateProgress = (courseId: number, progress: number) => {
        if (!user) return

        setEnrolledCourses(prev => {
            const updated = prev.map(course =>
                course.id === courseId ? { ...course, progress } : course
            )
            localStorage.setItem(`${STORAGE_KEY}-${user.id}`, JSON.stringify(updated))
            return updated
        })
    }

    const completeLesson = (courseId: number, lessonId: number) => {
        if (!user) return

        setEnrolledCourses(prev => {
            const updated = prev.map(course => {
                const completedLessons = course.completedLessons ?? []
                if (course.id === courseId && !completedLessons.includes(lessonId)) {
                    const newCompletedLessons = [...completedLessons, lessonId]
                    const totalLessons = 12 // SAMPLE_COURSE의 총 강의 수
                    const progress = Math.round((newCompletedLessons.length / totalLessons) * 100)
                    return { ...course, completedLessons: newCompletedLessons, progress }
                }
                return course
            })
            localStorage.setItem(`${STORAGE_KEY}-${user.id}`, JSON.stringify(updated))
            return updated
        })
    }

    const isEnrolled = (courseId: number) => {
        return enrolledCourses.some(course => course.id === courseId)
    }

    return {
        enrolledCourses,
        enrollCourse,
        updateProgress,
        completeLesson,
        isEnrolled
    }
}

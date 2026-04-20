import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import type { EnrolledCourse } from '../types/course'
import * as subscriptionsApi from '../shared/api/subscriptions'

// [주석처리] 기존 localStorage 기반 수강 목록 관리
// import { STORAGE_KEYS } from '../constants'

export const useMyCourses = () => {
    const { user } = useAuth()
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])

    useEffect(() => {
        if (!user) {
            setEnrolledCourses([])
            return
        }

        // [주석처리] 기존 localStorage 로드
        // const saved = localStorage.getItem(`${STORAGE_KEYS.MY_COURSES}-${user.id}`)
        // if (saved) { try { setEnrolledCourses(JSON.parse(saved)) } catch { setEnrolledCourses([]) } }

        subscriptionsApi.getMySubscriptions(user.id)
            .then(setEnrolledCourses)
            .catch((err) => {
                console.error('수강 목록 불러오기 실패:', err)
                setEnrolledCourses([])
            })
    }, [user])

    const enrollCourse = async (course: Omit<EnrolledCourse, 'enrolledAt' | 'progress' | 'completedLessons' | 'subscriptionId'>) => {
        if (!user) return

        // [주석처리] 기존 localStorage 저장
        // const newEnrolledCourse: EnrolledCourse = { ...course, enrolledAt: new Date().toISOString(), progress: 0, completedLessons: [] }
        // setEnrolledCourses(prev => { const updated = [newEnrolledCourse, ...prev]; localStorage.setItem(...); return updated })

        try {
            const enrolled = await subscriptionsApi.enrollLecture(course.id, user.id)
            setEnrolledCourses(prev => {
                if (prev.some(c => c.id === course.id)) return prev
                return [enrolled, ...prev]
            })
        } catch (err) {
            console.error('수강신청 실패:', err)
        }
    }

    // [주석처리] 기존 localStorage 기반 진도 업데이트 (서버에서 자동 계산)
    // const updateProgress = (courseId: number, progress: number) => { ... }

    const completeLesson = async (courseId: number, lessonId: number, _totalLessons: number) => {
        if (!user) return

        // [주석처리] 기존 localStorage 기반 완료 처리
        // setEnrolledCourses(prev => { const updated = prev.map(...); localStorage.setItem(...); return updated })

        const subscription = enrolledCourses.find(c => c.id === courseId)
        if (!subscription) return

        try {
            const updated = await subscriptionsApi.completeLessonApi(subscription.subscriptionId, lessonId)
            setEnrolledCourses(prev => prev.map(c => c.id === courseId ? updated : c))
        } catch (err) {
            console.error('강의 완료 처리 실패:', err)
        }
    }

    const isEnrolled = (courseId: number) => {
        return enrolledCourses.some(course => course.id === courseId)
    }

    const isCompleted = (courseId: number) => {
        const course = enrolledCourses.find(c => c.id === courseId)
        return course ? course.progress >= 100 : false
    }

    return {
        enrolledCourses,
        enrollCourse,
        completeLesson,
        isEnrolled,
        isCompleted
    }
}

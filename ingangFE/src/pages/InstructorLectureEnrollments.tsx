import { useEffect, useState } from 'react'
import Header from '../widgets/Header'
import { useAuth } from '../features/useAuth'
import {
    getInstructorLectureEnrollments,
    removeInstructorLectureEnrollment,
    type InstructorEnrollment,
} from '../shared/api/lectures'

const getLectureIdFromPath = () => {
    const match = window.location.pathname.match(/^\/instructor\/lectures\/(\d+)\/enrollments$/)
    return match ? Number(match[1]) : null
}

const InstructorLectureEnrollments = () => {
    const { isAuthenticated, user } = useAuth()
    const lectureId = getLectureIdFromPath()

    const [enrollments, setEnrollments] = useState<InstructorEnrollment[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (!isAuthenticated || user?.type !== 'instructor' || !lectureId) {
            setIsLoading(false)
            return
        }

        const load = async () => {
            setIsLoading(true)
            setErrorMessage('')
            try {
                const data = await getInstructorLectureEnrollments(lectureId)
                setEnrollments(data.enrollments)
                setTotalCount(data.totalCount)
            } catch (error) {
                console.error(error)
                setErrorMessage('수강생 목록을 불러오지 못했습니다.')
            } finally {
                setIsLoading(false)
            }
        }

        load()
    }, [isAuthenticated, user?.type, lectureId])

    const kickEnrollment = async (enrollmentId: number, nickname: string) => {
        if (!lectureId) return
        if (!window.confirm(`${nickname} 수강생을 강제 퇴출하시겠습니까?`)) return
        try {
            await removeInstructorLectureEnrollment(lectureId, enrollmentId)
            setEnrollments((prev) => prev.filter((e) => e.enrollmentId !== enrollmentId))
            setTotalCount((prev) => prev - 1)
        } catch (error) {
            console.error(error)
            alert('수강생 퇴출에 실패했습니다.')
        }
    }

    if (!isAuthenticated || user?.type !== 'instructor') {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="max-w-4xl px-4 py-16 mx-auto text-center">
                    <h1 className="text-2xl font-bold text-slate-900">강사 전용 화면입니다.</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <main className="max-w-4xl px-4 py-10 mx-auto">
                <a
                    href={`/instructor/lectures/${lectureId}`}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                    강의 편집으로
                </a>

                <div className="flex items-end justify-between gap-3 mt-3">
                    <h1 className="text-3xl font-bold">수강생 조회</h1>
                    {!isLoading && (
                        <p className="text-sm text-slate-500 mb-1">총 {totalCount}명</p>
                    )}
                </div>

                {errorMessage && (
                    <div className="p-4 mt-6 text-sm border rounded-2xl border-rose-200 bg-rose-50 text-rose-700">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="py-20 text-center text-slate-400">불러오는 중...</div>
                ) : enrollments.length === 0 ? (
                    <div className="p-10 mt-8 text-sm text-center rounded-3xl bg-white border border-slate-200 text-slate-500">
                        아직 수강생이 없습니다.
                    </div>
                ) : (
                    <div className="mt-8 overflow-hidden bg-white border divide-y rounded-3xl border-slate-200 divide-slate-100">
                        {enrollments.map((e) => (
                            <div
                                key={e.enrollmentId}
                                className="flex items-center justify-between gap-4 px-6 py-4"
                            >
                                <div>
                                    <p className="font-semibold">{e.student.nickname}</p>
                                    <p className="mt-0.5 text-sm text-slate-500">{e.student.email}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        수강 등록: {new Date(e.enrolledAt).toLocaleString('ko-KR')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => kickEnrollment(e.enrollmentId, e.student.nickname)}
                                    className="px-4 py-2 text-sm border rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 shrink-0"
                                >
                                    퇴출
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default InstructorLectureEnrollments

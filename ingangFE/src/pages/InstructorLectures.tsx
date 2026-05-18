import { useEffect, useState } from 'react'
import Header from '../widgets/Header'
import { useAuth } from '../features/useAuth'
import {
    deleteInstructorLecture,
    getInstructorLectures,
    type ApiLecture,
} from '../shared/api/lectures'

const currency = new Intl.NumberFormat('ko-KR')

const InstructorLectures = () => {
    const { isAuthenticated, user } = useAuth()
    const [lectures, setLectures] = useState<ApiLecture[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const loadLectures = async () => {
        setIsLoading(true)
        setErrorMessage('')
        try {
            const data = await getInstructorLectures()
            setLectures(data)
        } catch (error) {
            console.error(error)
            setErrorMessage('강의 목록을 불러오지 못했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated || user?.type !== 'instructor') {
            setIsLoading(false)
            return
        }
        loadLectures()
    }, [isAuthenticated, user?.type])

    if (!isAuthenticated || user?.type !== 'instructor') {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="max-w-4xl px-4 py-16 mx-auto text-center">
                    <h1 className="text-2xl font-bold text-slate-900">강사 전용 화면입니다.</h1>
                    <p className="mt-3 text-slate-600">강사 계정으로 로그인해야 내 강의를 관리할 수 있습니다.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <main className="max-w-6xl px-4 py-10 mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold tracking-wide text-amber-700">Instructor Studio</p>
                        <h1 className="mt-2 text-3xl font-bold">내 강의 관리</h1>
                    </div>
                    <a
                        href="/instructor/lectures/new"
                        className="px-5 py-3 font-semibold text-white rounded-2xl bg-amber-600 hover:bg-amber-700"
                    >
                        새 강의 만들기
                    </a>
                </div>

                {errorMessage && (
                    <div className="p-4 mt-6 text-sm border rounded-2xl border-rose-200 bg-rose-50 text-rose-700">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="py-20 mt-8 text-center rounded-3xl bg-white text-slate-500">
                        강의 목록을 불러오는 중입니다...
                    </div>
                ) : lectures.length === 0 ? (
                    <div className="py-20 mt-8 text-center rounded-3xl bg-white">
                        <p className="text-lg font-semibold text-slate-800">아직 등록한 강의가 없습니다.</p>
                        <p className="mt-2 text-slate-500">첫 강의를 만들고 커리큘럼을 붙여보세요.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 mt-8 md:grid-cols-2">
                        {lectures.map((lecture) => {
                            const category = lecture.tags?.[0]?.name ?? '미분류'
                            const sectionCount = lecture.sections?.length ?? 0
                            const lessonCount = lecture.sections?.reduce(
                                (sum, section) => sum + (section.videos?.length ?? 0),
                                0,
                            ) ?? 0

                            return (
                                <article key={lecture.id} className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700">
                                                {category}
                                            </span>
                                            <h2 className="mt-3 text-xl font-bold">{lecture.title}</h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {lecture.description ?? '강의 설명이 아직 없습니다.'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-500">가격</div>
                                            <div className="text-lg font-bold">{currency.format(lecture.price)}원</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
                                        <div className="p-3 rounded-2xl bg-slate-50">
                                            <div className="text-slate-500">난이도</div>
                                            <div className="mt-1 font-semibold">{lecture.level ?? '미지정'}</div>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-50">
                                            <div className="text-slate-500">섹션</div>
                                            <div className="mt-1 font-semibold">{sectionCount}개</div>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-50">
                                            <div className="text-slate-500">레슨</div>
                                            <div className="mt-1 font-semibold">{lessonCount}개</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <a
                                            href={`/instructor/lectures/${lecture.id}`}
                                            className="flex-1 px-4 py-3 text-sm font-semibold text-center border rounded-2xl border-slate-300 hover:bg-slate-50"
                                        >
                                            수정하기
                                        </a>
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm('이 강의를 삭제할까요?')) return
                                                try {
                                                    await deleteInstructorLecture(lecture.id)
                                                    await loadLectures()
                                                } catch (error) {
                                                    console.error(error)
                                                    alert('삭제할 수 없는 강의입니다. 수강/주문 이력이 있는지 확인해주세요.')
                                                }
                                            }}
                                            className="px-4 py-3 text-sm font-semibold border rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

export default InstructorLectures

import { useMyCourses } from '../features/useMyCourses'
import type { EnrolledCourse } from '../types/course'
import { secondsToTimeString } from '../shared/utils/course'

const buildResumeUrl = (course: EnrolledCourse) => {
    const base = `/course-watch?courseId=${course.id}`
    if (course.lastWatchedLessonId) {
        const secs = course.lessonProgress[course.lastWatchedLessonId] ?? 0
        return `${base}&lessonId=${course.lastWatchedLessonId}${secs > 0 ? `&startSeconds=${Math.floor(secs)}` : ''}`
    }
    return base
}

const MyCourses = () => {
    const { enrolledCourses } = useMyCourses()

    if (enrolledCourses.length === 0) {
        return (
            <section className="px-4 py-12 mx-auto max-w-7xl">
                <h2 className="mb-8 text-3xl font-bold text-center">마이페이지</h2>
                <div className="py-12 text-center">
                    <div className="mb-4 text-6xl">📚</div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-700">아직 수강 중인 강의가 없습니다</h3>
                    <p className="text-slate-600">관심 있는 강의를 찾아 수강해보세요!</p>
                </div>
            </section>
        )
    }

    return (
        <section className="px-4 py-12 mx-auto max-w-7xl">
            <h2 className="mb-8 text-3xl font-bold text-center">마이페이지</h2>
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800">
                    수강 중인 강의 ({enrolledCourses.length}개)
                </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => {
                    const lastLessonSecs = course.lastWatchedLessonId
                        ? (course.lessonProgress[course.lastWatchedLessonId] ?? 0)
                        : 0

                    return (
                        <div key={course.id} className="overflow-hidden transition-shadow bg-white rounded-lg shadow-sm hover:shadow-md">
                            <div className="relative aspect-video bg-slate-200">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-2 text-white bg-black bg-opacity-70">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>진행률</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 mt-1 rounded-full bg-slate-600">
                                        <div
                                            className="h-2 transition-all duration-300 bg-blue-500 rounded-full"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <h4 className="mb-1 text-lg font-semibold text-slate-800 line-clamp-2">
                                    {course.title}
                                </h4>
                                <p className="mb-1 text-sm text-slate-600">강사: {course.instructor}</p>
                                {lastLessonSecs > 0 && (
                                    <p className="mb-1 text-xs text-blue-500">
                                        ▶ 마지막 시청 위치: {secondsToTimeString(lastLessonSecs)}
                                    </p>
                                )}
                                <p className="text-xs text-slate-400">
                                    수강 시작: {new Date(course.enrolledAt).toLocaleDateString('ko-KR')}
                                </p>

                                <button
                                    onClick={() => (window.location.href = buildResumeUrl(course))}
                                    className="w-full px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
                                >
                                    {course.lastWatchedLessonId ? '이어서 보기 ▶' : '강의 시작하기'}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default MyCourses

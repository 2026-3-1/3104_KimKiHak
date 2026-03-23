import { useMyCourses } from './useMyCourses'

const MyCourses = () => {
    const { enrolledCourses } = useMyCourses()

    if (enrolledCourses.length === 0) {
        return (
            <section className="max-w-7xl px-4 py-12 mx-auto">
                <h2 className="mb-8 text-3xl font-bold text-center">마이페이지</h2>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">아직 수강 중인 강의가 없습니다</h3>
                    <p className="text-slate-600">관심 있는 강의를 찾아 수강해보세요!</p>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-7xl px-4 py-12 mx-auto">
            <h2 className="mb-8 text-3xl font-bold text-center">마이페이지</h2>

            <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800">
                    수강 중인 강의 ({enrolledCourses.length}개)
                </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                    <div key={course.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-slate-200 relative">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>진행률</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-2 mt-1">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h4 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-2">
                                {course.title}
                            </h4>
                            <p className="text-sm text-slate-600 mb-2">
                                강사: {course.instructor}
                            </p>
                            <p className="text-xs text-slate-500">
                                수강 시작: {new Date(course.enrolledAt).toLocaleDateString('ko-KR')}
                            </p>

                            <button
                                onClick={() => window.location.href = `/course-detail?id=${course.id}`}
                                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                강의 이어서 보기
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MyCourses
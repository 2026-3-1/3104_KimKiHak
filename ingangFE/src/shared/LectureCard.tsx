import type { Course } from '../types/course'

type LectureCardProps = {
    course: Course
    onClick?: () => void
}

const LectureCard = ({ course, onClick }: LectureCardProps) => {
    return (
        <div
            onClick={onClick}
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
                                className="px-2 py-1 text-xs rounded text-amber-800 bg-amber-100"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <button className="w-full py-2 text-sm font-medium text-white transition-colors rounded bg-amber-600 hover:bg-amber-700">
                    강의 보기
                </button>
            </div>
        </div>
    )
}

export default LectureCard

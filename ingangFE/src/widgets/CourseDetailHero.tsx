import type { CourseDetailFull } from '../types/course'
import { formatDuration } from '../shared/utils/course'

type CourseDetailHeroProps = {
  course: CourseDetailFull
  isAuthenticated: boolean
  isEnrolled: boolean
  onEnroll: () => void
  onStartWatching: () => void
  onOpenModal: () => void
}

const CourseDetailHero = ({
  course,
  isAuthenticated,
  isEnrolled,
  onEnroll,
  onStartWatching,
  onOpenModal,
}: CourseDetailHeroProps) => {
  const totalLessons = course.curriculum.reduce((sum, section) => sum + section.items.length, 0)
  const totalDuration = course.curriculum.reduce((total, section) => {
    return total + section.items.reduce((sectionTotal, item) => {
      const [minutes, seconds] = item.duration.split(':').map(Number)
      return sectionTotal + minutes * 60 + seconds
    }, 0)
  }, 0)

  return (
    <div className="text-white bg-slate-900">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-sm rounded bg-slate-700">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mb-4 text-3xl font-bold">{course.title}</h1>
            <p className="mb-4 text-slate-300">{course.instructor}</p>
            <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
              <span>난이도: {course.level}</span>
              <span>총 {totalLessons}강</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                isEnrolled ? (
                  <button
                    onClick={onStartWatching}
                    className="px-8 py-3 text-lg font-semibold bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    강의 이어서 보기
                  </button>
                ) : (
                  <button
                    onClick={onEnroll}
                    className="px-8 py-3 text-lg font-semibold bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    수강신청
                  </button>
                )
              ) : (
                <button
                  onClick={onOpenModal}
                  className="px-8 py-3 text-lg font-semibold bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  로그인 후 수강신청
                </button>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg aspect-video bg-slate-800">
            <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailHero

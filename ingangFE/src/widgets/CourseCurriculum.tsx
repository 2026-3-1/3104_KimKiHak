import type { CourseDetailFull, CurriculumItem, EnrolledCourse } from '../types/course'
import { formatDuration, getLessonStatus, secondsToTimeString } from '../shared/utils/course'

type CourseCurriculumProps = {
  course: CourseDetailFull
  enrolledCourse?: EnrolledCourse
  isEnrolled: boolean
  onOpenLesson: (item: CurriculumItem) => void
}

const CourseCurriculum = ({
  course,
  enrolledCourse,
  isEnrolled,
  onOpenLesson,
}: CourseCurriculumProps) => {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">커리큘럼</h2>
      <div className="space-y-6">
        {course.curriculum.map((section) => (
          <div key={section.id} className="overflow-hidden border rounded-lg">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <p className="text-sm text-slate-600">
                {section.items.length}강 ·{' '}
                {formatDuration(section.items.reduce((total, item) => total + item.durationSec, 0))}
              </p>
            </div>
            <div className="divide-y">
              {section.items.map((item) => {
                const canWatch    = item.isPreview || isEnrolled
                const watched     = enrolledCourse?.lessonProgress?.[item.id] ?? 0
                const status      = getLessonStatus(watched, item.durationSec)

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={canWatch ? () => onOpenLesson(item) : undefined}
                    className={`flex items-center justify-between w-full px-6 py-4 text-left ${
                      canWatch ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {status === 'COMPLETED' && <span className="text-green-600">✅</span>}
                      {status === 'IN_PROGRESS' && <span className="text-blue-500 text-sm">▶</span>}
                      {item.isPreview && (
                        <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                          미리보기
                        </span>
                      )}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span>{secondsToTimeString(item.durationSec)}</span>
                      {status === 'COMPLETED' && (
                        <span className="text-green-600 text-xs font-medium">시청 완료</span>
                      )}
                      {status === 'IN_PROGRESS' && (
                        <span className="text-blue-500 text-xs">시청 중</span>
                      )}
                      {canWatch && status === 'NOT_STARTED' ? (
                        <span className="text-blue-600 hover:text-blue-800">▶️ 재생</span>
                      ) : !canWatch ? (
                        <span className="text-slate-400">🔒 잠김</span>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseCurriculum

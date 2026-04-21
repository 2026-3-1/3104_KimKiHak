import type { LessonStatus } from '../../types/course'

/**
 * 데이터(watchedSeconds, durationSec)만으로 강의 상태를 판단합니다.
 * 이어보기 등 사용자 행동은 상태에 영향을 주지 않습니다.
 */
export const getLessonStatus = (watchedSeconds: number, durationSec: number): LessonStatus => {
  if (durationSec > 0 && watchedSeconds >= durationSec) return 'COMPLETED'
  if (watchedSeconds > 0) return 'IN_PROGRESS'
  return 'NOT_STARTED'
}

export const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remaining = safeSeconds % 60

  if (hours > 0) {
    return remaining > 0 ? `${hours}시간 ${minutes}분 ${remaining}초` : `${hours}시간 ${minutes}분`
  }

  if (minutes > 0) {
    return remaining > 0 ? `${minutes}분 ${remaining}초` : `${minutes}분`
  }

  return `${remaining}초`
}

export const secondsToTimeString = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remaining = safeSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`
  }

  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

export const buildCourseWatchUrl = (
  courseId: number,
  lessonId: number,
  youtubeId: string,
  startSeconds = 0,
) => {
  const params = new URLSearchParams({
    courseId: courseId.toString(),
    lessonId: lessonId.toString(),
    youtubeId,
  })
  if (startSeconds > 0) params.set('startSeconds', String(Math.floor(startSeconds)))
  return `/course-watch?${params.toString()}`
}

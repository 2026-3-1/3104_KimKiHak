export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  }

  return `${minutes}분`
}

export const secondsToTimeString = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

export const buildCourseWatchUrl = (
  courseId: number,
  lessonId: number,
  youtubeId: string,
) => {
  const params = new URLSearchParams({
    courseId: courseId.toString(),
    lessonId: lessonId.toString(),
    youtubeId,
  })

  return `/course-watch?${params.toString()}`
}

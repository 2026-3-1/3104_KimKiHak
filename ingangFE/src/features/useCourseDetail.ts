import { useEffect, useState } from 'react'
import { getLecture } from '../shared/api/lectures'
import type { ApiLectureDetail } from '../shared/api/lectures'
import type { CourseDetailFull, Review } from '../types/course'
import { secondsToTimeString } from '../shared/utils/course'

const mapLectureToCourseDetail = (lecture: ApiLectureDetail): CourseDetailFull => {
  const curriculum = lecture.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      id: section.id,
      title: section.title,
      items: section.videos
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          id: item.id,
          title: item.title,
          duration: secondsToTimeString(item.durationSec),
          youtubeId: item.youtubeId ?? undefined,
          isPreview: item.isPreview ?? false,
        })),
    }))

  const primaryYoutubeId =
    lecture.youtubeId ?? curriculum[0]?.items[0]?.youtubeId ?? ''

  return {
    id: lecture.id,
    title: lecture.title,
    instructor: lecture.instructor?.name ?? '알 수 없음',
    description: lecture.description ?? '',
    youtubeId: primaryYoutubeId,
    thumbnail:
      lecture.thumbnail ??
      (primaryYoutubeId
        ? `https://img.youtube.com/vi/${primaryYoutubeId}/hqdefault.jpg`
        : 'https://img.youtube.com/vi/default.jpg'),
    level: lecture.level ?? '입문',
    tags: lecture.tags?.map((tag) => tag.name) ?? [],
    curriculum,
    reviews: lecture.reviews.map((review) => ({
      id: review.id,
      author: review.user?.name ?? '익명',
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date(review.createdAt).toLocaleDateString('ko-KR'),
      userId: review.user?.id,
    })),
    learningGoals: lecture.learningGoals ?? ['실제 현장 강의 내용을 이해합니다.', '안전 수칙과 표준 절차를 습득합니다.', '공정별 실무 적용 능력을 키웁니다.'],
    prerequisites: lecture.prerequisites ?? ['기본적인 현장 규칙 이해', '기본적인 도구 사용법 지식', '안전 의식'],
    includes: lecture.includes ?? ['강의 영상 제공', '실습 예제 소개', '수료 체크리스트'],
  }
}

export const useCourseDetail = (courseId: number | null) => {
  const [course, setCourse] = useState<CourseDetailFull | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId || Number.isNaN(courseId)) {
      setErrorMessage('강의 정보를 찾을 수 없습니다.')
      setIsLoading(false)
      return
    }

    let isMounted = true

    const loadCourse = async () => {
      try {
        const lecture = await getLecture(courseId)
        if (isMounted) {
          const mappedCourse = mapLectureToCourseDetail(lecture)
          setCourse(mappedCourse)
          setReviews(mappedCourse.reviews)
        }
      } catch (error) {
        console.error(error)
        if (isMounted) {
          setErrorMessage('강의 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCourse()

    return () => {
      isMounted = false
    }
  }, [courseId])

  return {
    course,
    reviews,
    setReviews,
    isLoading,
    errorMessage,
  }
}

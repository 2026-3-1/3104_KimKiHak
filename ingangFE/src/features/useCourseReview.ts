import { useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { useMyCourses } from './useMyCourses'
import type { Review } from '../types/course'
import { RATING } from '../constants'
import * as reviewsApi from '../shared/api/reviews'

// [주석처리] 기존 localStorage 기반 리뷰 관리
// import { STORAGE_KEYS } from '../constants'

export const useCourseReview = (courseId: number, initialReviews: Review[]) => {
  const { isAuthenticated, user, openModal } = useAuth()
  const { isEnrolled, isCompleted } = useMyCourses()

  // [주석처리] 기존 localStorage에서 초기 리뷰 로드
  // const [localReviews, setLocalReviews] = useState<Review[]>(() => {
  //   const saved = localStorage.getItem(STORAGE_KEYS.COURSE_REVIEWS(courseId))
  //   if (saved) { try { return JSON.parse(saved) } catch { return initialReviews } }
  //   return initialReviews
  // })
  const [localReviews, setLocalReviews] = useState<Review[]>(initialReviews)

  const [showForm, setShowForm] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(RATING.DEFAULT)
  const [editingReview, setEditingReview] = useState<{ index: number; id?: number; text: string } | null>(null)
  const [showMenu, setShowMenu] = useState<number | null>(null)

  // [주석처리] 기존 localStorage에 리뷰 저장
  // useEffect(() => {
  //   localStorage.setItem(STORAGE_KEYS.COURSE_REVIEWS(courseId), JSON.stringify(localReviews))
  // }, [courseId, localReviews])

  const averageRating = useMemo(() => {
    if (localReviews.length === 0) return 0
    return Math.round((localReviews.reduce((sum, review) => sum + review.rating, 0) / localReviews.length) * 10) / 10
  }, [localReviews])

  const hasReviewed = !!(user && localReviews.some((review) => review.userId === user.id))
  const completed = isCompleted(courseId)

  const canWriteReview = isAuthenticated && completed && !hasReviewed
  const reviewButtonLabel = !isAuthenticated
    ? '로그인 후 작성'
    : !isEnrolled(courseId)
      ? '수강신청 후 작성'
      : !completed
        ? '완강 후 작성'
        : hasReviewed
          ? '이미 후기 작성'
          : '후기 작성'

  const handleReviewButtonClick = () => {
    if (!isAuthenticated) {
      openModal()
      return
    }
    if (!isEnrolled(courseId)) {
      alert('수강신청한 강의에만 후기를 작성할 수 있습니다.')
      return
    }
    if (!completed) {
      alert('완강한 강의에만 후기를 작성할 수 있습니다.')
      return
    }
    if (hasReviewed) {
      alert('이미 작성한 후기가 있습니다.')
      return
    }
    setShowForm((prev) => !prev)
  }

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      openModal()
      return
    }
    if (!isEnrolled(courseId)) {
      alert('수강신청한 강의에만 후기를 작성할 수 있습니다.')
      return
    }
    if (!completed) {
      alert('완강한 강의에만 후기를 작성할 수 있습니다.')
      return
    }
    if (hasReviewed) {
      alert('이미 작성한 후기가 있습니다.')
      return
    }
    if (!reviewText.trim()) {
      alert('후기를 입력해주세요.')
      return
    }

    // [주석처리] 기존 localStorage 기반 리뷰 등록
    // const newReview: Review = { author: user.name, rating: reviewRating, comment: reviewText.trim(), createdAt: ..., userId: user.id }
    // setLocalReviews((prev) => [newReview, ...prev])

    try {
      const newReview = await reviewsApi.createReview({
        lectureId: courseId,
        userId: user.id,
        rating: reviewRating,
        comment: reviewText.trim(),
      })
      setLocalReviews((prev) => [newReview, ...prev])
      setReviewText('')
      setReviewRating(RATING.DEFAULT)
      setShowForm(false)
      alert('후기가 저장되었습니다!')
    } catch (err) {
      console.error('후기 등록 실패:', err)
      alert('후기 등록에 실패했습니다.')
    }
  }

  const handleDeleteReview = async (reviewIndex: number) => {
    if (!window.confirm('후기를 삭제하시겠습니까?')) {
      setShowMenu(null)
      return
    }

    // [주석처리] 기존 localStorage 기반 삭제
    // setLocalReviews((prev) => prev.filter((_, index) => index !== reviewIndex))

    const review = localReviews[reviewIndex]
    if (review.id) {
      try {
        await reviewsApi.deleteReview(review.id)
      } catch (err) {
        console.error('후기 삭제 실패:', err)
        alert('후기 삭제에 실패했습니다.')
        return
      }
    }
    setLocalReviews((prev) => prev.filter((_, index) => index !== reviewIndex))
    setShowMenu(null)
  }

  const handleEditReview = (reviewIndex: number) => {
    const review = localReviews[reviewIndex]
    setEditingReview({ index: reviewIndex, id: review.id, text: review.comment })
    setShowMenu(null)
  }

  const handleUpdateReview = async () => {
    if (!editingReview || !editingReview.text.trim()) return

    // [주석처리] 기존 localStorage 기반 수정
    // setLocalReviews((prev) => prev.map((review, index) => index === editingReview.index ? { ...review, comment: editingReview.text.trim() } : review))

    if (editingReview.id) {
      try {
        const updated = await reviewsApi.updateReview(editingReview.id, {
          comment: editingReview.text.trim(),
        })
        setLocalReviews((prev) =>
          prev.map((review, index) => index === editingReview.index ? { ...review, ...updated } : review)
        )
      } catch (err) {
        console.error('후기 수정 실패:', err)
        alert('후기 수정에 실패했습니다.')
        return
      }
    } else {
      setLocalReviews((prev) =>
        prev.map((review, index) =>
          index === editingReview.index ? { ...review, comment: editingReview.text.trim() } : review
        )
      )
    }
    setEditingReview(null)
    alert('후기가 수정되었습니다!')
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
  }

  return {
    localReviews,
    averageRating,
    showForm,
    setShowForm,
    reviewText,
    setReviewText,
    reviewRating,
    setReviewRating,
    editingReview,
    setEditingReview,
    showMenu,
    setShowMenu,
    canWriteReview,
    currentUserId: user?.id,
    reviewButtonLabel,
    handleReviewButtonClick,
    handleSubmit,
    handleDeleteReview,
    handleEditReview,
    handleUpdateReview,
    handleCancelEdit,
  }
}

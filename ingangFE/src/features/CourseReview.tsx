import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useMyCourses } from './useMyCourses'

type Review = {
    author: string
    rating: number
    comment: string
    createdAt: string
    userId?: string
}

type CourseReviewProps = {
    courseId: number
    reviews: Review[]
    onSave: (reviews: Review[]) => void
}

const storageKey = (courseId: number) => `course-reviews-${courseId}`

const CourseReview = ({ courseId, reviews, onSave }: CourseReviewProps) => {
    const { isAuthenticated, user, openModal } = useAuth()
    const { isEnrolled } = useMyCourses()
    const [localReviews, setLocalReviews] = useState<Review[]>([])
    const [showForm, setShowForm] = useState(false)
    const [reviewText, setReviewText] = useState('')
    const [reviewRating, setReviewRating] = useState(5)
    const [isInitialized, setIsInitialized] = useState(false)
    const [editingReview, setEditingReview] = useState<{ index: number; text: string } | null>(null)
    const [showMenu, setShowMenu] = useState<number | null>(null)

    // 초기 로딩 시 localStorage에서 데이터 불러오기
    useEffect(() => {
        const saved = localStorage.getItem(storageKey(courseId))
        if (saved) {
            try {
                const parsedReviews = JSON.parse(saved)
                setLocalReviews(parsedReviews)
            } catch {
                setLocalReviews(reviews)
            }
        } else {
            setLocalReviews(reviews)
        }
        setIsInitialized(true)
    }, [courseId])

    // localReviews가 변경될 때 localStorage에 저장하고 부모 컴포넌트에 알림
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(storageKey(courseId), JSON.stringify(localReviews))
            onSave(localReviews)
        }
    }, [courseId, localReviews, onSave, isInitialized])

    // 메뉴 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMenu !== null) {
                const target = event.target as Element
                if (!target.closest('.review-menu')) {
                    setShowMenu(null)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showMenu])

    const averageRating = localReviews.length > 0
        ? Math.round((localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length) * 10) / 10
        : 0

    const handleSubmit = () => {
        if (!isAuthenticated || !user) {
            openModal()
            return
        }

        if (!isEnrolled(courseId)) {
            alert('수강신청한 강의에만 후기를 작성할 수 있습니다.')
            return
        }

        if (!reviewText.trim()) {
            alert('후기를 입력해주세요.')
            return
        }

        const newReview: Review = {
            author: user.name,
            rating: reviewRating,
            comment: reviewText.trim(),
            createdAt: new Date().toISOString().split('T')[0],
            userId: user.id
        }

        setLocalReviews((prev) => [newReview, ...prev])
        setReviewText('')
        setReviewRating(5)
        setShowForm(false)
        alert('후기가 저장되었습니다!')
    }

    const handleDeleteReview = (reviewIndex: number) => {
        if (window.confirm('후기를 삭제하시겠습니까?')) {
            setLocalReviews((prev) => prev.filter((_, index) => index !== reviewIndex))
        }
        setShowMenu(null)
    }

    const handleEditReview = (reviewIndex: number) => {
        const review = localReviews[reviewIndex]
        setEditingReview({ index: reviewIndex, text: review.comment })
        setShowMenu(null)
    }

    const handleUpdateReview = () => {
        if (editingReview && editingReview.text.trim()) {
            setLocalReviews((prev) =>
                prev.map((review, index) =>
                    index === editingReview.index
                        ? { ...review, comment: editingReview.text.trim() }
                        : review
                )
            )
            setEditingReview(null)
            alert('후기가 수정되었습니다!')
        }
    }

    const handleCancelEdit = () => {
        setEditingReview(null)
    }

    return (
        <div>
            <div className="p-6 mb-8 border-2 border-blue-300 rounded-lg bg-blue-50">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-slate-800">수강평을 남겨주세요</h3>
                        <p className="mb-3 text-sm text-slate-700">
                            여러분의 소중한 수강평이 다른 학습자들에게 큰 도움이 됩니다.
                        </p>
                        <p className="text-sm text-slate-600">간단한 피드백을 남겨주세요.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                openModal()
                            } else if (!isEnrolled(courseId)) {
                                alert('수강신청한 강의에만 후기를 작성할 수 있습니다.')
                            } else {
                                setShowForm((prev) => !prev)
                            }
                        }}
                        className={`px-6 py-2 font-semibold text-white rounded hover:bg-blue-700 whitespace-nowrap ${
                            !isAuthenticated || !isEnrolled(courseId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'
                        }`}
                        disabled={!isAuthenticated || !isEnrolled(courseId)}
                    >
                        {!isAuthenticated ? '로그인 후 작성' : !isEnrolled(courseId) ? '수강신청 후 작성' : '후기 작성'}
                    </button>
                </div>

                {showForm && (
                    <div className="pt-4 border-t border-blue-300">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-semibold text-slate-700">별점</span>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setReviewRating(value)}
                                        className={`text-2xl transition-colors ${
                                            value <= reviewRating ? 'text-yellow-400' : 'text-slate-300'
                                        }`}
                                        aria-label={`별점 ${value}점`}
                                        title={`${value}점`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm text-slate-600">{reviewRating}점</span>
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="여기에 수강평을 작성해주세요..."
                            className="w-full p-3 mb-4 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={5}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                후기 등록
                            </button>
                            <button
                                onClick={() => {
                                    setReviewText('')
                                    setReviewRating(5)
                                    setShowForm(false)
                                }}
                                className="px-6 py-2 font-semibold bg-white border rounded text-slate-700 border-slate-300 hover:bg-slate-100"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl font-bold">{averageRating}</div>
                    <div>
                        <div className="flex mb-1 text-yellow-400">{'★'.repeat(Math.round(averageRating))}</div>
                        <p className="text-sm text-slate-600">{localReviews.length}개의 수강평</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {localReviews.map((review, index) => (
                    <div key={index} className="p-6 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200">
                                    {review.author[0]}
                                </div>
                                <div>
                                    <p className="font-semibold">{review.author}</p>
                                    <p className="text-sm text-slate-600">{review.createdAt}</p>
                                </div>
                            </div>
                            <div className="relative review-menu">
                                {isAuthenticated && user && review.userId === user.id && (
                                    <button
                                        onClick={() => setShowMenu(showMenu === index ? null : index)}
                                        className="p-2 text-gray-400 hover:text-gray-600"
                                        title="메뉴"
                                    >
                                        ⋯
                                    </button>
                                )}
                                {showMenu === index && (
                                    <div className="absolute right-0 z-10 w-32 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <button
                                            onClick={() => handleEditReview(index)}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReview(index)}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 별점 표시 */}
                        <div className="flex items-center gap-1 mb-3">
                            <div className="flex text-yellow-400">
                                {'★'.repeat(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">({review.rating})</span>
                        </div>

                        {/* 후기 내용 또는 수정 폼 */}
                        {editingReview && editingReview.index === index ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editingReview.text}
                                    onChange={(e) => setEditingReview(prev => prev ? { ...prev, text: e.target.value } : null)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateReview}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                    >
                                        수정 완료
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-700">{review.comment}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CourseReview

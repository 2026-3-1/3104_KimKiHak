import { useEffect } from 'react'
import { useCourseReview } from '../features/useCourseReview'
import type { Review } from '../types/course'

type CourseReviewProps = {
    courseId: number
    reviews: Review[]
    onSave: (reviews: Review[]) => void
}

const CourseReview = ({ courseId, reviews, onSave }: CourseReviewProps) => {
    const {
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
        currentUserId,
        reviewButtonLabel,
        handleReviewButtonClick,
        handleSubmit,
        handleDeleteReview,
        handleEditReview,
        handleUpdateReview,
        handleCancelEdit,
    } = useCourseReview(courseId, reviews)

    useEffect(() => {
        onSave(localReviews)
    }, [localReviews, onSave])

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
                        onClick={handleReviewButtonClick}
                        className="px-6 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 whitespace-nowrap"
                    >
                        {reviewButtonLabel}
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
                                {review.userId && currentUserId && review.userId === currentUserId && (
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
                                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReview(index)}
                                            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                            <div className="flex text-yellow-400">{'★'.repeat(review.rating)}</div>
                            <span className="text-sm text-gray-500">({review.rating})</span>
                        </div>

                        {editingReview && editingReview.index === index ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editingReview.text}
                                    onChange={(e) => setEditingReview((prev) => prev ? { ...prev, text: e.target.value } : null)}
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

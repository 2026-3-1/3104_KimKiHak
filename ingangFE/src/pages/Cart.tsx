import { useState } from 'react'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import Header from '../widgets/Header'
import { useAuth } from '../features/useAuth'
import { useCart } from '../features/useCart'
import { createOrder } from '../shared/api/orders'
import type { CartItem } from '../shared/api/cart'

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY ?? 'test_ck_placeholder'

const formatPrice = (price: number) =>
    price === 0 ? '무료' : `${price.toLocaleString()}원`

const Cart = () => {
    const { isAuthenticated, user } = useAuth()
    const { items, isLoading, removeItem } = useCart(user?.id ?? null)
    const [selected, setSelected] = useState<Set<number>>(new Set())
    const [isPaying, setIsPaying] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-3xl px-4 py-20 mx-auto text-center">
                    <p className="mb-4 text-lg text-slate-600">로그인 후 장바구니를 이용할 수 있습니다.</p>
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="px-6 py-2 font-semibold text-white rounded-lg bg-amber-600 hover:bg-amber-700"
                    >
                        홈으로 이동
                    </button>
                </div>
            </div>
        )
    }

    const toggleSelect = (lectureId: number) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(lectureId)) next.delete(lectureId)
            else next.add(lectureId)
            return next
        })
    }

    const toggleAll = () => {
        if (selected.size === items.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(items.map((i) => i.lectureId)))
        }
    }

    const selectedItems: CartItem[] = items.filter((i) => selected.has(i.lectureId))
    const totalAmount = selectedItems.reduce((sum, i) => sum + i.lecture.price, 0)

    const handleRemove = async (lectureId: number) => {
        await removeItem(lectureId)
        setSelected((prev) => {
            const next = new Set(prev)
            next.delete(lectureId)
            return next
        })
    }

    const handleCheckout = async () => {
        if (selectedItems.length === 0) {
            setErrorMsg('결제할 강의를 선택해주세요.')
            return
        }
        setErrorMsg('')
        setIsPaying(true)
        try {
            const lectureIds = selectedItems.map((i) => i.lectureId)
            const order = await createOrder(user.id, lectureIds)

            if (order.totalAmount === 0) {
                // 무료 강의는 Toss 없이 바로 서버에서 처리
                const { confirmPayment } = await import('../shared/api/payments')
                await confirmPayment('free', order.id, 0)
                alert('수강신청이 완료되었습니다!')
                window.location.href = '/'
                return
            }

            const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)
            const payment = tossPayments.payment({ customerKey: user.id })

            const orderName =
                selectedItems.length === 1
                    ? selectedItems[0].lecture.title
                    : `${selectedItems[0].lecture.title} 외 ${selectedItems.length - 1}건`

            await payment.requestPayment({
                method: 'CARD',
                amount: { currency: 'KRW', value: order.totalAmount },
                orderId: String(order.id),
                orderName,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
                customerEmail: user.email,
                customerName: user.name,
            })
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : '결제 중 오류가 발생했습니다.'
            setErrorMsg(msg)
            setIsPaying(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="max-w-5xl px-4 py-10 mx-auto">
                <h1 className="mb-8 text-2xl font-bold text-slate-900">장바구니</h1>

                {isLoading ? (
                    <p className="text-center text-slate-500">불러오는 중...</p>
                ) : items.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="mb-4 text-slate-500">장바구니가 비어있습니다.</p>
                        <button
                            onClick={() => (window.location.href = '/courses')}
                            className="px-6 py-2 font-semibold text-white rounded-lg bg-amber-600 hover:bg-amber-700"
                        >
                            강의 둘러보기
                        </button>
                    </div>
                ) : (
                    <div className="gap-8 lg:grid lg:grid-cols-3">
                        {/* 강의 목록 */}
                        <div className="mb-6 lg:col-span-2 lg:mb-0">
                            {/* 전체 선택 */}
                            <div className="flex items-center px-4 py-3 mb-3 bg-white border rounded-lg border-slate-200">
                                <input
                                    type="checkbox"
                                    id="select-all"
                                    checked={selected.size === items.length && items.length > 0}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded accent-amber-600"
                                />
                                <label htmlFor="select-all" className="ml-3 text-sm font-medium cursor-pointer text-slate-700">
                                    전체 선택 ({selected.size}/{items.length})
                                </label>
                            </div>

                            {/* 강의 카드 목록 */}
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 bg-white border rounded-lg border-slate-200"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.has(item.lectureId)}
                                            onChange={() => toggleSelect(item.lectureId)}
                                            className="flex-shrink-0 w-4 h-4 rounded accent-amber-600"
                                        />
                                        <img
                                            src={item.lecture.thumbnail ?? '/placeholder.png'}
                                            alt={item.lecture.title}
                                            className="flex-shrink-0 object-cover w-24 h-16 rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-slate-900">
                                                {item.lecture.title}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {item.lecture.instructor?.name ?? ''}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-amber-700">
                                                {formatPrice(item.lecture.price)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.lectureId)}
                                            className="flex-shrink-0 p-1 text-slate-400 hover:text-red-500"
                                            title="삭제"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 결제 요약 */}
                        <div className="lg:col-span-1">
                            <div className="sticky p-6 bg-white border rounded-lg border-slate-200 top-4">
                                <h2 className="mb-4 text-lg font-bold text-slate-900">결제 금액</h2>
                                <div className="mb-4 space-y-2">
                                    {selectedItems.length === 0 ? (
                                        <p className="text-sm text-slate-400">선택된 강의가 없습니다.</p>
                                    ) : (
                                        selectedItems.map((i) => (
                                            <div key={i.id} className="flex justify-between text-sm">
                                                <span className="truncate max-w-[60%] text-slate-600">
                                                    {i.lecture.title}
                                                </span>
                                                <span className="font-medium text-slate-800">
                                                    {formatPrice(i.lecture.price)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex justify-between pt-4 border-t border-slate-200">
                                    <span className="font-bold text-slate-900">합계</span>
                                    <span className="text-lg font-bold text-amber-700">
                                        {totalAmount.toLocaleString()}원
                                    </span>
                                </div>

                                {errorMsg && (
                                    <p className="mt-3 text-sm text-center text-red-500">{errorMsg}</p>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={isPaying || selectedItems.length === 0}
                                    className="w-full py-3 mt-4 font-semibold text-white rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPaying ? '처리 중...' : `${selectedItems.length}개 강의 결제하기`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Cart

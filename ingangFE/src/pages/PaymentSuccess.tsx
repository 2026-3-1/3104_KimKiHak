import { useEffect, useState } from 'react'
import { confirmPayment } from '../shared/api/payments'

const PaymentSuccess = () => {
    const params = new URLSearchParams(window.location.search)
    const paymentKey = params.get('paymentKey') ?? ''
    const orderId = Number(params.get('orderId'))
    const amount = Number(params.get('amount'))
    const isValid = !!paymentKey && !!orderId && !Number.isNaN(amount)

    const [status, setStatus] = useState<'loading' | 'done' | 'error'>(() => (isValid ? 'loading' : 'error'))
    const [errorMsg, setErrorMsg] = useState(() => (isValid ? '' : '결제 정보가 올바르지 않습니다.'))

    useEffect(() => {
        if (!isValid) return

        confirmPayment(paymentKey, orderId, amount)
            .then(() => setStatus('done'))
            .catch((e: unknown) => {
                const msg = e instanceof Error ? e.message : '결제 확인 중 오류가 발생했습니다.'
                setErrorMsg(msg)
                setStatus('error')
            })
    }, [amount, isValid, orderId, paymentKey])

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-4 border-4 rounded-full border-amber-600 border-t-transparent animate-spin" />
                    <p className="text-slate-600">결제를 확인하는 중입니다...</p>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="max-w-md p-8 text-center bg-white rounded-lg shadow">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-slate-900">결제 확인 실패</h1>
                    <p className="mb-6 text-slate-500">{errorMsg}</p>
                    <button
                        onClick={() => (window.location.href = '/cart')}
                        className="px-6 py-2 font-semibold text-white rounded-lg bg-amber-600 hover:bg-amber-700"
                    >
                        장바구니로 돌아가기
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="max-w-md p-8 text-center bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="mb-2 text-xl font-bold text-slate-900">결제 완료!</h1>
                <p className="mb-6 text-slate-500">강의가 수강 목록에 추가되었습니다.</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="px-6 py-2 font-semibold text-white rounded-lg bg-amber-600 hover:bg-amber-700"
                    >
                        내 강의 보기
                    </button>
                    <button
                        onClick={() => (window.location.href = '/courses')}
                        className="px-6 py-2 font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                        강의 더 보기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PaymentSuccess

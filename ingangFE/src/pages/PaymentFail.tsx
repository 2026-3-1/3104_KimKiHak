const PaymentFail = () => {
    const params = new URLSearchParams(window.location.search)
    const errorCode = params.get('code') ?? ''
    const errorMsg = params.get('message') ?? '결제가 취소되었습니다.'

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="max-w-md p-8 text-center bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="mb-2 text-xl font-bold text-slate-900">결제 실패</h1>
                <p className="mb-2 text-slate-500">{errorMsg}</p>
                {errorCode && (
                    <p className="mb-6 text-xs text-slate-400">오류 코드: {errorCode}</p>
                )}
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

export default PaymentFail

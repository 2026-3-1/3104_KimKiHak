import { useState } from 'react'
import { useAuth } from '../features/useAuth'
import { useCart } from '../features/useCart'
import AuthModal from './AuthModal'

const Header = () => {
    const { isAuthenticated, user, logout, isModalOpen, openModal, closeModal, login } = useAuth()
    const { items } = useCart(user?.id ?? null)
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/search?search=${encodeURIComponent(searchQuery.trim())}`
        }
    }

    return (
        <>
            <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="flex items-center h-16 gap-4 px-4 mx-auto max-w-7xl">
                    <a
                        href="/"
                        className="flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900"
                    >
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-700 text-white">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9v2h14V9c0-3.87-3.13-7-7-7zm0 3c1.66 0 3 1.34 3 3v1H9V8c0-1.66 1.34-3 3-3z" />
                                <path d="M4 13h16v3c0 2.76-2.24 5-5 5H9c-2.76 0-5-2.24-5-5v-3z" opacity="0.9" />
                            </svg>
                        </span>
                        노가다워크
                    </a>

                    <div className="items-center flex-1 hidden md:flex">
                        <form onSubmit={handleSearch} className="relative w-full max-w-md">
                            <span className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400">
                                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                                    <path
                                        fill="currentColor"
                                        d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 21.5 21.5 20l-6-6Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
                                    />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="원하는 작업, 장비, 키워드를 검색해보세요"
                                className="w-full h-10 pl-10 pr-4 text-sm border rounded-full border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {/* 장바구니 아이콘 (로그인 시에만) */}
                        {isAuthenticated && (
                            <a
                                href="/cart"
                                className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100"
                                title="장바구니"
                            >
                                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {items.length > 0 && (
                                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full bg-amber-600">
                                        {items.length > 9 ? '9+' : items.length}
                                    </span>
                                )}
                            </a>
                        )}

                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-3">
                                {user.type === 'instructor' && (
                                    <a
                                        href="/instructor/lectures"
                                        className="px-4 py-2 text-sm font-medium rounded-full text-amber-700 bg-amber-50 hover:bg-amber-100"
                                    >
                                        강사 관리
                                    </a>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-amber-600 rounded-full">
                                        {user.name[0]}
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {user.type === 'student' ? '학생' : '강사'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 text-sm font-medium rounded-full text-slate-700 hover:bg-slate-100"
                                >
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={openModal}
                                    className="px-4 py-2 text-sm font-medium rounded-full text-slate-700 hover:bg-slate-100"
                                >
                                    로그인
                                </button>
                                <button
                                    onClick={openModal}
                                    className="px-4 py-2 text-sm font-medium rounded-full bg-amber-600 text-white hover:bg-amber-700"
                                >
                                    회원가입
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <AuthModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onLogin={login}
            />
        </>
    )
}

export default Header

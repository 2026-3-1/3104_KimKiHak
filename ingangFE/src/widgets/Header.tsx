import { useState } from 'react'
import { useAuth } from '../features/useAuth'
import AuthModal from './AuthModal'

const Header = () => {
    const { isAuthenticated, user, logout, isModalOpen, openModal, closeModal, login } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // 검색 결과 페이지로 이동 (쿼리 파라미터로 검색어 전달)
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
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-3">
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

export default Header;

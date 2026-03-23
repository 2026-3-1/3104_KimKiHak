import { useState } from 'react'
import type { User } from './useAuth'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onLogin: (user: User) => void
}

type UserType = 'student' | 'instructor'
type AuthMode = 'select' | 'login' | 'register'

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
    const [mode, setMode] = useState<AuthMode>('select')
    const [userType, setUserType] = useState<UserType | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    })

    const resetForm = () => {
        setMode('select')
        setUserType(null)
        setFormData({
            email: '',
            password: '',
            name: '',
            confirmPassword: ''
        })
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleUserTypeSelect = (type: UserType) => {
        setUserType(type)
        setMode('login')
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (mode === 'register') {
            // 회원가입 로직
            if (formData.password !== formData.confirmPassword) {
                alert('비밀번호가 일치하지 않습니다.')
                return
            }

            if (!formData.name.trim()) {
                alert('이름을 입력해주세요.')
                return
            }

            // 로컬스토리지에서 기존 사용자 확인
            const existingUsers = JSON.parse(localStorage.getItem('ingang_users') || '[]')
            const userExists = existingUsers.find((u: any) => u.email === formData.email)

            if (userExists) {
                alert('이미 존재하는 이메일입니다.')
                return
            }

            // 새 사용자 생성
            const newUser: User = {
                id: Date.now().toString(),
                email: formData.email,
                name: formData.name,
                type: userType!,
                createdAt: new Date().toISOString()
            }

            // 사용자 저장
            existingUsers.push({ ...newUser, password: formData.password })
            localStorage.setItem('ingang_users', JSON.stringify(existingUsers))

            onLogin(newUser)
            handleClose()
        } else {
            // 로그인 로직
            const users = JSON.parse(localStorage.getItem('ingang_users') || '[]')
            const user = users.find((u: any) =>
                u.email === formData.email && u.password === formData.password
            )

            if (user) {
                const { password, ...userWithoutPassword } = user
                onLogin(userWithoutPassword)
                handleClose()
            } else {
                alert('이메일 또는 비밀번호가 올바르지 않습니다.')
            }
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">
                        {mode === 'select' && '사용자 유형 선택'}
                        {mode === 'login' && `${userType === 'student' ? '학생' : '강사'} 로그인`}
                        {mode === 'register' && `${userType === 'student' ? '학생' : '강사'} 회원가입`}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* 내용 */}
                <div className="p-6">
                    {mode === 'select' && (
                        <div className="space-y-4">
                            <p className="text-center text-gray-600 mb-6">
                                Ingang에 오신 것을 환영합니다!<br />
                                어떤 계정으로 로그인하시겠습니까?
                            </p>

                            <button
                                onClick={() => handleUserTypeSelect('student')}
                                className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🎓</div>
                                    <div className="font-semibold text-lg">학생으로 시작하기</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        강의를 수강하고 학습을 진행하세요
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleUserTypeSelect('instructor')}
                                className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">👨‍🏫</div>
                                    <div className="font-semibold text-lg">강사로 시작하기</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        강의를 만들고 학생들을 가르치세요
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {(mode === 'login' || mode === 'register') && (
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {mode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        이름
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="이름을 입력하세요"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="이메일을 입력하세요"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                />
                            </div>

                            {mode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        비밀번호 확인
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="비밀번호를 다시 입력하세요"
                                        required
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                {mode === 'login' ? '로그인' : '회원가입'}
                            </button>
                        </form>
                    )}

                    {(mode === 'login' || mode === 'register') && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AuthModal
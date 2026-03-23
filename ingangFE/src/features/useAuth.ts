import { useState, useEffect } from 'react'

export interface User {
    id: string
    email: string
    name: string
    type: 'student' | 'instructor'
    createdAt: string
}

export interface AuthState {
    isAuthenticated: boolean
    user: User | null
    isModalOpen: boolean
}

const STORAGE_KEY = 'ingang_auth'

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        isModalOpen: false
    })

    // 로컬스토리지에서 사용자 정보 로드
    useEffect(() => {
        const savedAuth = localStorage.getItem(STORAGE_KEY)
        if (savedAuth) {
            try {
                const parsed = JSON.parse(savedAuth)
                setAuthState({
                    isAuthenticated: true,
                    user: parsed.user,
                    isModalOpen: false
                })
            } catch (error) {
                console.error('Failed to parse auth data:', error)
                localStorage.removeItem(STORAGE_KEY)
            }
        }
    }, [])

    const login = (user: User) => {
        const authData = { user, loginTime: new Date().toISOString() }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
        setAuthState({
            isAuthenticated: true,
            user,
            isModalOpen: false
        })
    }

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY)
        setAuthState({
            isAuthenticated: false,
            user: null,
            isModalOpen: false
        })
    }

    const openModal = () => {
        setAuthState(prev => ({ ...prev, isModalOpen: true }))
    }

    const closeModal = () => {
        setAuthState(prev => ({ ...prev, isModalOpen: false }))
    }

    return {
        ...authState,
        login,
        logout,
        openModal,
        closeModal
    }
}
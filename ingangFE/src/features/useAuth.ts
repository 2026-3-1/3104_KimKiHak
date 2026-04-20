import { useState, useEffect } from 'react'
import type { User, AuthState } from '../types/auth'
import { STORAGE_KEYS } from '../constants'

export type { User }

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        isModalOpen: false
    })

    // localStorage에서 사용자 정보 로드
    useEffect(() => {
        const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH)
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
                localStorage.removeItem(STORAGE_KEYS.AUTH)
            }
        }
    }, [])

    const login = (user: User, accessToken: string) => {
        const authData = { user, accessToken, loginTime: new Date().toISOString() }
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData))
        setAuthState({
            isAuthenticated: true,
            user,
            isModalOpen: false
        })
    }

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.AUTH)
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

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

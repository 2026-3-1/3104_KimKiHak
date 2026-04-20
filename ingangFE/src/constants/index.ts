// Storage Keys
export const STORAGE_KEYS = {
    AUTH: 'ingang_auth',
    COURSE_REVIEWS: (courseId: number) => `course-reviews-${courseId}`,
    MY_COURSES: 'my_courses',
}

// API Configuration
export const API_CONFIG = {
    DEFAULT_TIMEOUT: 10000,
    DEFAULT_BASE_URL: 'http://localhost:3000',
}

// Validation Rules
export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 8,
    MIN_USERNAME_LENGTH: 2,
    MAX_USERNAME_LENGTH: 50,
    MAX_REVIEW_LENGTH: 2000,
}

// User Types
export const USER_TYPES = {
    STUDENT: 'student',
    INSTRUCTOR: 'instructor',
} as const

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
    BEGINNER: '입문',
    INTERMEDIATE: '중급',
    ADVANCED: '고급',
} as const

// Rating Constants
export const RATING = {
    MIN: 1,
    MAX: 5,
    DEFAULT: 5,
} as const

// URL Paths
export const URL_PATHS = {
    HOME: '/',
    COURSES: '/courses',
    COURSE_DETAIL: '/course-detail',
    COURSE_WATCH: '/course-watch',
} as const

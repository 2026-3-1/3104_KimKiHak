export type Course = {
    id: number
    title: string
    instructor: string
    thumbnail: string
    level: string
    tags: string[]
    description?: string
    totalDurationSec?: number
}

export type Review = {
    id?: number
    author: string
    rating: number
    comment: string
    createdAt: string
    userId?: string
}

export type CourseDetail = Course & {
    reviews?: Review[]
    enrollmentCount?: number
    totalRating?: number
}

// Curriculum types
export type CurriculumItem = {
    id: number
    title: string
    duration: string    // formatted "M:SS"
    durationSec: number // raw seconds — used for status calculation
    youtubeId?: string
    isPreview?: boolean
}

export type LessonStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export type CurriculumSection = {
    id: number
    title: string
    items: CurriculumItem[]
}

export type CourseDetailFull = {
    id: number
    title: string
    instructor: string
    description: string
    youtubeId: string
    thumbnail: string
    level: string
    tags: string[]
    price: number
    curriculum: CurriculumSection[]
    reviews: Review[]
    learningGoals?: string[]
    prerequisites?: string[]
    includes?: string[]
}

// Enrolled course type
export type EnrolledCourse = {
    id: number
    subscriptionId: number
    title: string
    instructor: string
    thumbnail: string
    enrolledAt: string
    progress: number // 0-100
    completedLessons: number[]
    lessonProgress: Record<number, number> // lessonId → watchedSeconds
    lastWatchedLessonId: number | null     // 가장 최근 시청한 lessonId
}

export type Bookmark = {
    id: number
    subscriptionId: number
    lessonId: number
    seconds: number
    label: string
    createdAt: string
}

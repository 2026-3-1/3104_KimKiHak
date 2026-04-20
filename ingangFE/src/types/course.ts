export type Course = {
    id: number
    title: string
    instructor: string
    thumbnail: string
    level: string
    tags: string[]
    description?: string
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
    duration: string
    youtubeId?: string
    isPreview?: boolean
}

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
    completedLessons: number[] // 완료된 강의 ID 목록
}

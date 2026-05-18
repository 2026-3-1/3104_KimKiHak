export type MainCategory = {
    id: number
    title: string
    subs: string[]
}

export const CATEGORIES: MainCategory[] = [
    { id: 0, title: '전체', subs: [] },
    { id: 1, title: '철거 / 해체', subs: ['철거'] },
    { id: 2, title: '구조 / 골조 시공', subs: ['목수', '조적', '비계공'] },
    { id: 3, title: '마감 / 인테리어', subs: ['미장', '타일', '도배', '페인트'] },
    { id: 4, title: '설비 / 전기', subs: ['전기/배선', '배관/보일러'] },
    { id: 5, title: '제작 / 설치', subs: ['용접', '구조물 조립'] },
    { id: 6, title: '운반 / 기초노동', subs: ['곰방'] },
    { id: 7, title: '현장관리 / 관리자', subs: ['공사관리', '안전관리'] },
]

export function getSubsForCategory(category: string): string[] | null {
    const main = CATEGORIES.find(c => c.title === category)
    return main ? main.subs : null
}

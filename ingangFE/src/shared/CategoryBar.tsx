import type { ReactNode } from 'react'

type Category = {
    id: number
    title: string
    icon: ReactNode
    subs: string[]
}

const categories: Category[] = [
    {
        id: 0,
        title: '전체',
        subs: [],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-slate-600" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
    },
    {
        id: 1,
        title: '철거 / 해체',
        subs: ['철거'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-amber-700" aria-hidden="true">
                <path d="M3 21l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 4l6 6-8.5 8.5-6-6L14 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 2,
        title: '구조 / 골조 시공',
        subs: ['목수', '조적', '비계공'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-orange-600" aria-hidden="true">
                <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M5 21V10l7-7 7 7v11" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 3,
        title: '마감 / 인테리어',
        subs: ['미장', '타일', '도배', '페인트'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-lime-600" aria-hidden="true">
                <rect x="3" y="3" width="13" height="10" rx="1" stroke="currentColor" strokeWidth="2" />
                <path d="M16 8h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1h-3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9 13v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 4,
        title: '설비 / 전기',
        subs: ['전기/배선', '배관/보일러'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-yellow-600" aria-hidden="true">
                <path d="M13 2L3 14h7v8l10-12h-7V2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 5,
        title: '제작 / 설치',
        subs: ['용접', '구조물 조립'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-rose-600" aria-hidden="true">
                <path d="M7 21l10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 7l4-4 4 4M3 21l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 14l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 6,
        title: '운반 / 기초노동',
        subs: ['곰방'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-violet-600" aria-hidden="true">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
                <path d="M13 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 7,
        title: '현장관리 / 관리자',
        subs: ['공사관리', '안전관리'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-emerald-600" aria-hidden="true">
                <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 9h8M8 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
]

function resolveSelection(selectedCategory: string): { mainId: number; sub: string | null } {
    if (!selectedCategory) return { mainId: 0, sub: null }
    for (const c of categories) {
        if (c.subs.includes(selectedCategory)) return { mainId: c.id, sub: selectedCategory }
    }
    const main = categories.find(c => c.title === selectedCategory)
    if (main) return { mainId: main.id, sub: null }
    return { mainId: 0, sub: null }
}

type Props = {
    selectedCategory?: string
    onSelect?: (category: string) => void
    showSubs?: boolean
}

const CategoryBar = ({ selectedCategory = '', onSelect, showSubs = true }: Props) => {
    const { mainId, sub: selectedSub } = resolveSelection(selectedCategory)

    const visibleSubs =
        mainId === 0
            ? categories.flatMap(c => c.subs)
            : (categories[mainId]?.subs ?? [])

    const handleMainClick = (cat: Category) => {
        const next = cat.id === 0 ? '' : cat.title
        if (onSelect) {
            onSelect(next)
        } else {
            window.location.href = next ? `/courses?category=${encodeURIComponent(next)}` : '/courses'
        }
    }

    const itemBase =
        'group flex flex-col items-center justify-center w-28 h-28 rounded-[28px] border px-4 text-center text-sm font-semibold text-slate-900 shadow-sm transition duration-300 ease-out hover:-translate-y-3 hover:border-amber-200 hover:bg-white hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:w-32 sm:h-32'

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center justify-center w-full gap-3 sm:gap-4">
                {categories.map((cat) => {
                    const isActive = mainId === cat.id
                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleMainClick(cat)}
                            className={`${itemBase} ${isActive ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}
                        >
                            <div className="flex items-center justify-center transition duration-300 shadow-sm h-14 w-14 rounded-3xl bg-gradient-to-br from-amber-100 to-white group-hover:scale-110 group-hover:bg-amber-100">
                                {cat.icon}
                            </div>
                            <span className="mt-3 leading-tight transition-colors duration-300 text-slate-900 group-hover:text-amber-900">
                                {cat.title}
                            </span>
                        </button>
                    )
                })}
            </div>

            {showSubs && <div className="mt-6 border-t border-slate-200" />}

            {showSubs && visibleSubs.length > 0 && (
                <div className="flex flex-wrap justify-start gap-2 mt-4">
                    {visibleSubs.map((s) => {
                        const isActive = selectedSub === s
                        return (
                            <button
                                key={s}
                                onClick={() => onSelect ? onSelect(s) : (window.location.href = `/courses?category=${encodeURIComponent(s)}`)}

                                className={`px-6 py-2 rounded-full border text-sm font-medium transition duration-200 focus-visible:outline-none ${
                                    isActive
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                        : 'bg-white border-slate-300 text-slate-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50'
                                }`}
                            >
                                {s}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CategoryBar

import type { ReactNode } from 'react'

const CategoryBar = () => {
    const categories: { title: string; href: string; icon: ReactNode }[] = [
        {
            title: '철거/타설',
            href: '/courses?category=철거/타설',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-amber-700" aria-hidden="true">
                    <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 18v-8h12v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
            ),
        },
        {
            title: '전기/배선',
            href: '/courses?category=전기/배선',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-yellow-600" aria-hidden="true">
                    <path d="M13 2L3 14h7v8l10-12h-7V2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
            ),
        },
        {
            title: '배관/설비',
            href: '/courses?category=배관/설비',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-sky-600" aria-hidden="true">
                    <path d="M4 7h16v10H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M8 7V4m8 17v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 11h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            title: '용접/조립',
            href: '/courses?category=용접/조립',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-rose-600" aria-hidden="true">
                    <path d="M7 21l10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 7l4-4 4 4M3 21l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 14l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            title: '현장관리',
            href: '/courses?category=현장관리',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-emerald-600" aria-hidden="true">
                    <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 9h8M8 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            title: '기초기술',
            href: '/courses?category=기초기술',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-violet-600" aria-hidden="true">
                    <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M8 10h8M8 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
        },
    ]

    const itemClassName =
        'group flex flex-col items-center justify-center w-28 h-28 rounded-[28px] border border-slate-200 bg-slate-50 px-4 text-center text-sm font-semibold text-slate-900 shadow-sm transition duration-300 ease-out hover:-translate-y-3 hover:border-amber-200 hover:bg-white hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:w-32 sm:h-32'

    return (
        <div className="flex flex-wrap items-center justify-center w-full gap-3 mt-10 sm:gap-4">
            {categories.map((item) => (
                <a key={item.title} href={item.href} className={itemClassName}>
                    <div className="flex items-center justify-center transition duration-300 shadow-sm h-14 w-14 rounded-3xl bg-gradient-to-br from-amber-100 to-white group-hover:scale-120 group-hover:bg-amber-100">
                        {item.icon}
                    </div>
                    <span className="mt-3 leading-tight transition-colors duration-300 text-slate-900 group-hover:text-amber-900">
                        {item.title}
                    </span>
                </a>
            ))}
        </div>
    )
}

export default CategoryBar

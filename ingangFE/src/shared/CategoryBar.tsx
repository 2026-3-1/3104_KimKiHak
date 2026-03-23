const CategoryBar = () => {
    const categories = [
        { title: '프론트엔드', href: '/fe' },
        { title: '백엔드', href: '/backend' },
        { title: '데이터', href: '/data' },
        { title: 'AI/ML', href: '/ai' },
        { title: '기획', href: '/planning' },
        { title: '디자인', href: '/design' },
    ]

    const itemClassName =
        'flex items-center justify-center w-20 h-20 text-sm font-semibold transition bg-white border shadow-sm rounded-2xl border-slate-200 text-slate-800 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md sm:h-24 sm:w-24'

    return (
        <div className="flex flex-wrap items-center justify-center w-full gap-3 mt-10 sm:gap-4">
            {categories.map((item) =>
                item.href ? (
                    <a key={item.title} href={item.href} className={itemClassName}>
                        {item.title}
                    </a>
                ) : (
                    <div key={item.title} className={itemClassName}>
                        {item.title}
                    </div>
                )
            )}
        </div>
    )
}

export default CategoryBar

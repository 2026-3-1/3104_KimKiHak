import { useEffect, useState } from 'react'
import { getLectures } from './api/lectures'

type BigCard = {
    id: number
    title: string
    instructor: string
    level: '입문' | '초급' | '중급'
    tag: string
}

const BigCardBar = ({ category }: { category: string }) => {
    const [cards, setCards] = useState<BigCard[]>([])

    useEffect(() => {
        let isMounted = true

        const load = async () => {
            try {
                const lectures = await getLectures()
                if (!isMounted) return

                const normalized = category.toLowerCase()
                const filtered = lectures.filter(lecture => {
                    if (!lecture.tags || lecture.tags.length === 0) return true
                    return lecture.tags.some(tag =>
                        tag.name.toLowerCase().includes(normalized)
                    )
                })

                const mapped: BigCard[] = filtered.slice(0, 6).map(lecture => ({
                    id: lecture.id,
                    title: lecture.title,
                    instructor: lecture.instructor?.name ?? '알 수 없음',
                    level:
                        lecture.level === '초급' || lecture.level === '중급'
                            ? lecture.level
                            : '입문',
                    tag: lecture.tags?.[0]?.name ?? category.toUpperCase(),
                }))

                setCards(mapped)
            } catch (error) {
                console.warn('카테고리 강의를 불러오지 못했습니다.', error)
            }
        }

        load()

        return () => {
            isMounted = false
        }
    }, [category])

    return (
        <div className="grid w-full grid-cols-1 gap-4 mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards.map((card) => (
                <article
                    key={card.title}
                    onClick={() => window.location.href = `/course-detail?id=${card.id}`}
                    className="overflow-hidden transition bg-white border shadow-sm cursor-pointer rounded-2xl border-slate-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                >
                    <div className="relative h-28 bg-linear-to-br from-slate-100 via-slate-50 to-blue-50">
                        <div className="absolute flex items-center gap-2 left-3 top-3">
                            <span className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-white/90 rounded-full">
                                {card.tag}
                            </span>
                        </div>
                        <div className="absolute right-3 bottom-3 flex items-center justify-center w-9 h-9 text-[11px] font-bold text-white bg-blue-600 rounded-xl">
                            {card.level}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5 p-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                                {card.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">{card.instructor}</p>
                        </div>

                        <div className="text-xs text-slate-600">
                            난이도: <span className="font-semibold text-slate-800">{card.level}</span>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    )
}

export default BigCardBar

import BigCardBar from '../shared/BigCardBar'
import CategoryBar from '../shared/CategoryBar'
import Header from '../widgets/Header'

const BE = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <main className="px-4 pt-3 pb-20 mx-auto max-w-7xl">
                <section className="mt-10">
                    <CategoryBar />
                </section>

                <section className="mt-12">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">백엔드 강의</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="px-3 py-1 text-xs font-semibold bg-white border rounded-full text-slate-700 border-slate-200">난이도</span>
                        </div>
                    </div>
                    <BigCardBar category="be" />
                </section>
            </main>
        </div>
    )
}

export default BE

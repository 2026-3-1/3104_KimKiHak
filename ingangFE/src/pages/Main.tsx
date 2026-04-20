import CategoryBar from '../shared/CategoryBar'
import { useAuth } from '../features/useAuth'
import MyCourses from '../widgets/MyCourses'

const Main = () => {
    const { isAuthenticated } = useAuth()

    return (
        <main className="min-h-[70vh] bg-white text-slate-900">
            <section className="flex flex-col items-center px-4 pt-20 pb-24 mx-auto text-center max-w-7xl">
                <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    시청하면 {' '}
                    <span className="text-transparent bg-gradient-to-r from-amber-700 to-orange-500 bg-clip-text">
                        할 일 {' '}
                    </span>
                    이 보이다!
                </h1>
                <p className="mt-4 text-sm font-medium text-slate-600 sm:text-base">
                    배우고 싶은 현장 기술을 골라서 시청해보세요.
                </p>

                <CategoryBar />
            </section>

            {isAuthenticated && <MyCourses />}
        </main>
    )
}

export default Main;

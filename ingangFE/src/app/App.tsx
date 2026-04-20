import Header from '../widgets/Header';
import Main from '../pages/Main';
import Search from '../pages/Search';
import CourseList from '../pages/CourseList';
import CourseDetail from '../pages/CourseDetail';
import CourseWatch from '../pages/CourseWatch';

const App = () => {
    const path = window.location.pathname

    if (path === '/courses') return <CourseList />
    if (path === '/course-detail') return <CourseDetail />
    if (path.startsWith('/course-watch')) return <CourseWatch />
    if (path === '/search') {
        return (
            <>
                <Header />
                <Search />
            </>
        )
    }

    return (
        <>
            <Header />
            <Main />
        </>
    )
}

export default App;

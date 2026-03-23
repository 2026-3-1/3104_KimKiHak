import Header from './widgets/Header';
import Main from './pages/Main';
import FE from './pages/FE';
import BE from './pages/BE';
import Data from './pages/Data';
import AI from './pages/AI';
import Planning from './pages/Planning';
import Design from './pages/Design';
import CourseDetail from './pages/CourseDetail';
import CourseWatch from './pages/CourseWatch';

const App = () => {
    const path = window.location.pathname

    if (path === '/fe') return <FE />
    if (path === '/backend') return <BE />
    if (path === '/data') return <Data />
    if (path === '/ai') return <AI />
    if (path === '/planning') return <Planning />
    if (path === '/design') return <Design />
    if (path === '/course-detail') return <CourseDetail />
    if (path.startsWith('/course-watch')) return <CourseWatch />

    return (
        <>
            <Header />
            <Main />
        </>
    )
}

export default App;

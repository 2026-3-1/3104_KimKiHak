import Header from '../widgets/Header';
import Main from '../pages/Main';
import Search from '../pages/Search';
import CourseList from '../pages/CourseList';
import CourseDetail from '../pages/CourseDetail';
import CourseWatch from '../pages/CourseWatch';
import Cart from '../pages/Cart';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFail from '../pages/PaymentFail';

const App = () => {
    const path = window.location.pathname

    if (path === '/courses') return <CourseList />
    if (path === '/course-detail') return <CourseDetail />
    if (path.startsWith('/course-watch')) return <CourseWatch />
    if (path === '/cart') return <Cart />
    if (path === '/payment/success') return <PaymentSuccess />
    if (path === '/payment/fail') return <PaymentFail />
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

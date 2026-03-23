import CategoryBar from '../shared/CategoryBar'
import { useAuth } from '../features/useAuth'
import MyCourses from '../features/MyCourses'
import { useState, useEffect } from 'react'

type Course = {
    id: number
    title: string
    instructor: string
    thumbnail: string
    level: string
    tags: string[]
    description?: string
}

// 더미 강의 데이터
const SAMPLE_COURSES: Course[] = [
    {
        id: 1,
        title: '프론트엔드 실전 React 강좌',
        instructor: '강사 김코딩',
        thumbnail: 'https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg',
        level: '중급',
        tags: ['React', 'TypeScript', '웹개발'],
        description: 'React 기초부터 실무 프로젝트까지 한 번에 학습합니다.'
    },
    {
        id: 2,
        title: '백엔드 Node.js 마스터 클래스',
        instructor: '강사 박서버',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['Node.js', 'Express', 'API'],
        description: 'Node.js로 백엔드 개발을 마스터하세요.'
    },
    {
        id: 3,
        title: 'Python 데이터 분석 실무',
        instructor: '강사 이데이터',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['Python', 'Pandas', '데이터분석'],
        description: 'Python으로 데이터 분석을 실무에서 적용해보세요.'
    },
    {
        id: 4,
        title: 'AI 머신러닝 기초부터 실전까지',
        instructor: '강사 최AI',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '고급',
        tags: ['AI', '머신러닝', 'Python'],
        description: 'AI와 머신러닝의 기초부터 실전 적용까지.'
    },
    {
        id: 5,
        title: 'UI/UX 디자인 실무 가이드',
        instructor: '강사 정디자인',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['UI/UX', '디자인', 'Figma'],
        description: '현업에서 사용하는 UI/UX 디자인 기법을 배우세요.'
    },
    {
        id: 6,
        title: 'Vue.js 프론트엔드 개발',
        instructor: '강사 김뷰',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['Vue.js', 'JavaScript', '프론트엔드'],
        description: 'Vue.js로 현대적인 웹 애플리케이션을 만들어보세요.'
    },
    {
        id: 7,
        title: 'JavaScript 알고리즘 마스터',
        instructor: '강사 박알고',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '고급',
        tags: ['JavaScript', '알고리즘', '코딩테스트'],
        description: 'JavaScript로 알고리즘 문제를 해결하는 방법을 배우세요.'
    },
    // BigCardBar FE 카테고리 강의들
    {
        id: 8,
        title: 'HTML/CSS로 시작하는 웹 퍼블리싱',
        instructor: '김하늘',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '입문',
        tags: ['HTML', 'CSS', '웹 퍼블리싱'],
        description: 'HTML과 CSS를 활용한 웹 퍼블리싱 기초를 배우세요.'
    },
    {
        id: 9,
        title: 'JavaScript 기본기 완성',
        instructor: '박도현',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['JavaScript', '프론트엔드'],
        description: 'JavaScript의 기본 개념과 실전 활용법을 마스터하세요.'
    },
    {
        id: 10,
        title: 'React로 만드는 첫 SPA',
        instructor: '이도윤',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['React', 'SPA', '웹 개발'],
        description: 'React를 사용하여 싱글 페이지 애플리케이션을 만들어보세요.'
    },
    {
        id: 11,
        title: 'Vue.js 실전 프로젝트',
        instructor: '최민수',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['Vue.js', '프론트엔드'],
        description: 'Vue.js를 활용한 실전 프로젝트 개발 방법을 배우세요.'
    },
    {
        id: 12,
        title: 'TypeScript 마스터 클래스',
        instructor: '장영희',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['TypeScript', 'JavaScript'],
        description: 'TypeScript의 기초부터 고급 기능까지 완벽하게 마스터하세요.'
    },
    {
        id: 13,
        title: '웹 접근성 및 SEO',
        instructor: '김지현',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['웹 접근성', 'SEO', '웹 개발'],
        description: '웹 접근성과 검색 엔진 최적화 기법을 배우세요.'
    },
    // BigCardBar BE 카테고리 강의들
    {
        id: 14,
        title: 'Node.js로 시작하는 백엔드',
        instructor: '박성훈',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '입문',
        tags: ['Node.js', '백엔드'],
        description: 'Node.js를 사용하여 백엔드 개발의 기초를 배우세요.'
    },
    {
        id: 15,
        title: 'Express.js API 개발',
        instructor: '이민정',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['Express.js', 'API', '백엔드'],
        description: 'Express.js를 사용하여 RESTful API를 개발하는 방법을 배우세요.'
    },
    {
        id: 16,
        title: 'Python Django 웹 개발',
        instructor: '정우진',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['Python', 'Django', '백엔드'],
        description: 'Django 프레임워크를 사용하여 웹 애플리케이션을 개발하세요.'
    },
    {
        id: 17,
        title: 'Java Spring Boot 마스터',
        instructor: '김태영',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['Java', 'Spring Boot', '백엔드'],
        description: 'Spring Boot를 사용하여 엔터프라이즈급 애플리케이션을 개발하세요.'
    },
    {
        id: 18,
        title: 'RESTful API 설계',
        instructor: '오지영',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['API', 'REST', '백엔드'],
        description: '효율적인 RESTful API 설계 원칙과 구현 방법을 배우세요.'
    },
    {
        id: 19,
        title: '데이터베이스 설계 및 최적화',
        instructor: '최준혁',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['데이터베이스', 'SQL', '최적화'],
        description: '효율적인 데이터베이스 설계와 쿼리 최적화 기법을 배우세요.'
    },
    // BigCardBar Data 카테고리 강의들
    {
        id: 20,
        title: 'Python 데이터 분석 입문',
        instructor: '김수진',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '입문',
        tags: ['Python', '데이터 분석'],
        description: 'Python을 사용하여 데이터 분석의 기초를 배우세요.'
    },
    {
        id: 21,
        title: 'Pandas와 NumPy 활용',
        instructor: '박지훈',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['Pandas', 'NumPy', '데이터 분석'],
        description: 'Pandas와 NumPy 라이브러리를 활용한 데이터 처리 방법을 배우세요.'
    },
    {
        id: 22,
        title: '데이터 시각화 with Matplotlib',
        instructor: '이영미',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['Matplotlib', '데이터 시각화'],
        description: 'Matplotlib을 사용하여 효과적인 데이터 시각화를 구현하세요.'
    },
    {
        id: 23,
        title: 'SQL 데이터베이스 쿼리',
        instructor: '정민호',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '입문',
        tags: ['SQL', '데이터베이스'],
        description: 'SQL을 사용하여 데이터베이스 쿼리 작성 방법을 배우세요.'
    },
    {
        id: 24,
        title: '머신러닝 기초',
        instructor: '최예린',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['머신러닝', 'AI'],
        description: '머신러닝의 기초 개념과 알고리즘을 배우세요.'
    },
    {
        id: 25,
        title: '빅데이터 처리 기법',
        instructor: '김도현',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['빅데이터', '데이터 처리'],
        description: '대용량 데이터 처리 기법과 도구들을 배우세요.'
    },
    // BigCardBar AI 카테고리 강의들
    {
        id: 26,
        title: '머신러닝 기초 개념',
        instructor: '박준혁',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '입문',
        tags: ['머신러닝', 'AI'],
        description: '머신러닝의 기본 개념과 원리를 이해하세요.'
    },
    {
        id: 27,
        title: '딥러닝 with TensorFlow',
        instructor: '김미라',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['딥러닝', 'TensorFlow', 'AI'],
        description: 'TensorFlow를 사용하여 딥러닝 모델을 구축하고 학습시키세요.'
    },
    {
        id: 28,
        title: '컴퓨터 비전 기초',
        instructor: '이태영',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['컴퓨터 비전', 'AI'],
        description: '컴퓨터 비전을 위한 기초 알고리즘과 기법을 배우세요.'
    },
    {
        id: 29,
        title: '자연어 처리 입문',
        instructor: '정수연',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['자연어 처리', 'NLP', 'AI'],
        description: '자연어 처리의 기초 개념과 응용 방법을 배우세요.'
    },
    {
        id: 30,
        title: 'AI 모델 배포와 서빙',
        instructor: '최민기',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['AI', '모델 배포', 'MLOps'],
        description: '학습된 AI 모델을 실제 서비스에 배포하는 방법을 배우세요.'
    },
    {
        id: 31,
        title: '강화학습 실전',
        instructor: '오세진',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['강화학습', 'AI'],
        description: '강화학습 알고리즘의 실전 적용 방법을 배우세요.'
    },
    // BigCardBar Planning 카테고리 강의들
    {
        id: 32,
        title: '프로덕트 기획 입문',
        instructor: '김나영',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '입문',
        tags: ['프로덕트 기획', '기획'],
        description: '프로덕트 기획의 기초 개념과 프로세스를 배우세요.'
    },
    {
        id: 33,
        title: '사용자 경험 설계',
        instructor: '박지민',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['UX', '사용자 경험', '기획'],
        description: '사용자 중심의 경험 설계 방법을 배우세요.'
    },
    {
        id: 34,
        title: '애자일 방법론 실무',
        instructor: '이준호',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['애자일', '프로젝트 관리', '기획'],
        description: '애자일 방법론의 실전 적용 기법을 배우세요.'
    },
    {
        id: 35,
        title: '데이터 기반 의사결정',
        instructor: '정예진',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['데이터 분석', '의사결정', '기획'],
        description: '데이터를 활용한 효과적인 의사결정 방법을 배우세요.'
    },
    {
        id: 36,
        title: '프로젝트 관리 마스터',
        instructor: '최성민',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['프로젝트 관리', '기획'],
        description: '프로젝트 관리의 핵심 원칙과 도구들을 마스터하세요.'
    },
    {
        id: 37,
        title: '시장 조사 및 분석',
        instructor: '김하늘',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['시장 조사', '분석', '기획'],
        description: '효과적인 시장 조사와 분석 방법을 배우세요.'
    },
    // BigCardBar Design 카테고리 강의들
    {
        id: 38,
        title: 'UI/UX 디자인 기초',
        instructor: '박소연',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '입문',
        tags: ['UI/UX', '디자인'],
        description: 'UI/UX 디자인의 기초 개념과 원칙을 배우세요.'
    },
    {
        id: 39,
        title: 'Figma 실전 디자인',
        instructor: '이민수',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['Figma', '디자인 도구'],
        description: 'Figma를 사용하여 실전 디자인 작업을 수행하세요.'
    },
    {
        id: 40,
        title: '브랜딩 디자인 전략',
        instructor: '김지현',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['브랜딩', '디자인'],
        description: '효과적인 브랜딩을 위한 디자인 전략을 배우세요.'
    },
    {
        id: 41,
        title: '모션 그래픽스',
        instructor: '정우진',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['모션 그래픽스', '애니메이션'],
        description: '모션 그래픽스 제작 기법과 도구들을 배우세요.'
    },
    {
        id: 42,
        title: '웹 디자인 트렌드',
        instructor: '최예린',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '중급',
        tags: ['웹 디자인', '트렌드'],
        description: '최신 웹 디자인 트렌드와 구현 방법을 배우세요.'
    },
    {
        id: 43,
        title: '프로토타이핑 실무',
        instructor: '오지영',
        thumbnail: 'https://img.youtube.com/vi/default.jpg',
        level: '초급',
        tags: ['프로토타이핑', '디자인'],
        description: '효과적인 프로토타이핑 기법과 도구들을 배우세요.'
    }
]

const Main = () => {
    const { isAuthenticated } = useAuth()
    const [searchResults, setSearchResults] = useState<Course[]>([])
    const [showResults, setShowResults] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // URL에서 검색어 파라미터 읽기
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const searchParam = urlParams.get('search')
        if (searchParam) {
            const query = decodeURIComponent(searchParam)
            setSearchQuery(query)
            // 강의 제목, 강사명, 태그, 설명으로 검색
            const results = SAMPLE_COURSES.filter(course =>
                course.title.toLowerCase().includes(query.toLowerCase()) ||
                course.instructor.toLowerCase().includes(query.toLowerCase()) ||
                course.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
                (course.description && course.description.toLowerCase().includes(query.toLowerCase()))
            )
            setSearchResults(results)
            setShowResults(true)
        }
    }, [])

    const handleCourseClick = (courseId: number) => {
        window.location.href = `/course-detail?id=${courseId}`
    }

    const clearSearch = () => {
        setSearchResults([])
        setShowResults(false)
        setSearchQuery('')
        // URL에서 search 파라미터 제거
        const url = new URL(window.location.href)
        url.searchParams.delete('search')
        window.history.replaceState({}, '', url.pathname)
    }

    return (
        <main className="min-h-[70vh] bg-white text-slate-900">
            <section className="flex flex-col items-center px-4 pt-20 pb-24 mx-auto text-center max-w-7xl">
                <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    코딩을 {' '}
                    <span className="text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text">
                        쉽고 빠르게 {' '}
                    </span>
                    배우다
                </h1>
                <p className="mt-4 text-sm font-medium text-slate-600 sm:text-base">
                    오늘, 성장할 IT 카테고리를 고르세요
                </p>

                {/* 검색 결과 표시 */}
                {showResults && (
                    <div className="w-full max-w-6xl mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">
                                "{searchQuery}" 검색 결과 ({searchResults.length}개)
                            </h2>
                            <button
                                onClick={clearSearch}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                닫기 ✕
                            </button>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {searchResults.map(course => (
                                    <div
                                        key={course.id}
                                        onClick={() => handleCourseClick(course.id)}
                                        className="overflow-hidden transition-all duration-200 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-lg"
                                    >
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="object-cover w-full h-40"
                                        />
                                        <div className="p-4">
                                            <h3 className="mb-2 text-lg font-semibold line-clamp-2">
                                                {course.title}
                                            </h3>
                                            <p className="mb-2 text-sm text-gray-600">
                                                {course.instructor}
                                            </p>
                                            <p className="mb-3 text-sm text-gray-700 line-clamp-2">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                                                    {course.level}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {course.tags.slice(0, 2).map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="w-full py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded hover:bg-blue-700">
                                                강의 보기
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <div className="mb-4 text-4xl">🔍</div>
                                <p className="mb-2 text-lg">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
                                <p className="text-sm">다른 키워드로 검색해보세요.</p>
                            </div>
                        )}
                    </div>
                )}

                <CategoryBar />
            </section>

            {isAuthenticated && <MyCourses />}
        </main>
    )
}

export default Main;

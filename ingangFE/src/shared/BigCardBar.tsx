type BigCard = {
    title: string
    instructor: string
    level: '입문' | '초급' | '중급'
    rating: number
    reviews: number
    tag: string
}

const BigCardBar = ({ category }: { category: string }) => {
    const getCardsByCategory = (cat: string): BigCard[] => {
        switch (cat) {
            case 'fe':
                return [
                    {
                        title: 'HTML/CSS로 시작하는 웹 퍼블리싱',
                        instructor: '김하늘',
                        level: '입문',
                        rating: 4.8,
                        reviews: 312,
                        tag: '프론트',
                    },
                    {
                        title: 'JavaScript 기본기 완성',
                        instructor: '박도현',
                        level: '초급',
                        rating: 4.7,
                        reviews: 428,
                        tag: '프론트',
                    },
                    {
                        title: 'React로 만드는 첫 SPA',
                        instructor: '이도윤',
                        level: '중급',
                        rating: 4.9,
                        reviews: 620,
                        tag: '웹 개발',
                    },
                    {
                        title: 'Vue.js 실전 프로젝트',
                        instructor: '최민수',
                        level: '중급',
                        rating: 4.6,
                        reviews: 245,
                        tag: '프론트',
                    },
                    {
                        title: 'TypeScript 마스터 클래스',
                        instructor: '장영희',
                        level: '초급',
                        rating: 4.8,
                        reviews: 389,
                        tag: '프론트',
                    },
                    {
                        title: '웹 접근성 및 SEO',
                        instructor: '김지현',
                        level: '중급',
                        rating: 4.5,
                        reviews: 178,
                        tag: '웹 개발',
                    },
                ]
            case 'be':
                return [
                    {
                        title: 'Node.js로 시작하는 백엔드',
                        instructor: '박성훈',
                        level: '입문',
                        rating: 4.7,
                        reviews: 298,
                        tag: '백엔드',
                    },
                    {
                        title: 'Express.js API 개발',
                        instructor: '이민정',
                        level: '초급',
                        rating: 4.6,
                        reviews: 345,
                        tag: '백엔드',
                    },
                    {
                        title: 'Python Django 웹 개발',
                        instructor: '정우진',
                        level: '중급',
                        rating: 4.8,
                        reviews: 412,
                        tag: '백엔드',
                    },
                    {
                        title: 'Java Spring Boot 마스터',
                        instructor: '김태영',
                        level: '중급',
                        rating: 4.9,
                        reviews: 567,
                        tag: '백엔드',
                    },
                    {
                        title: 'RESTful API 설계',
                        instructor: '오지영',
                        level: '초급',
                        rating: 4.5,
                        reviews: 234,
                        tag: '백엔드',
                    },
                    {
                        title: '데이터베이스 설계 및 최적화',
                        instructor: '최준혁',
                        level: '중급',
                        rating: 4.7,
                        reviews: 321,
                        tag: '데이터베이스',
                    },
                ]
            case 'data':
                return [
                    {
                        title: 'Python 데이터 분석 입문',
                        instructor: '김수진',
                        level: '입문',
                        rating: 4.6,
                        reviews: 267,
                        tag: '데이터',
                    },
                    {
                        title: 'Pandas와 NumPy 활용',
                        instructor: '박지훈',
                        level: '초급',
                        rating: 4.8,
                        reviews: 389,
                        tag: '데이터',
                    },
                    {
                        title: '데이터 시각화 with Matplotlib',
                        instructor: '이영미',
                        level: '초급',
                        rating: 4.5,
                        reviews: 198,
                        tag: '데이터',
                    },
                    {
                        title: 'SQL 데이터베이스 쿼리',
                        instructor: '정민호',
                        level: '입문',
                        rating: 4.7,
                        reviews: 445,
                        tag: '데이터베이스',
                    },
                    {
                        title: '머신러닝 기초',
                        instructor: '최예린',
                        level: '중급',
                        rating: 4.9,
                        reviews: 523,
                        tag: 'AI/ML',
                    },
                    {
                        title: '빅데이터 처리 기법',
                        instructor: '김도현',
                        level: '중급',
                        rating: 4.6,
                        reviews: 287,
                        tag: '데이터',
                    },
                ]
            case 'ai':
                return [
                    {
                        title: '머신러닝 기초 개념',
                        instructor: '박준혁',
                        level: '입문',
                        rating: 4.7,
                        reviews: 356,
                        tag: 'AI/ML',
                    },
                    {
                        title: '딥러닝 with TensorFlow',
                        instructor: '김미라',
                        level: '중급',
                        rating: 4.8,
                        reviews: 412,
                        tag: 'AI/ML',
                    },
                    {
                        title: '컴퓨터 비전 기초',
                        instructor: '이태영',
                        level: '초급',
                        rating: 4.6,
                        reviews: 278,
                        tag: 'AI/ML',
                    },
                    {
                        title: '자연어 처리 입문',
                        instructor: '정수연',
                        level: '초급',
                        rating: 4.5,
                        reviews: 234,
                        tag: 'AI/ML',
                    },
                    {
                        title: 'AI 모델 배포와 서빙',
                        instructor: '최민기',
                        level: '중급',
                        rating: 4.9,
                        reviews: 189,
                        tag: 'AI/ML',
                    },
                    {
                        title: '강화학습 실전',
                        instructor: '오세진',
                        level: '중급',
                        rating: 4.7,
                        reviews: 167,
                        tag: 'AI/ML',
                    },
                ]
            case 'planning':
                return [
                    {
                        title: '프로덕트 기획 입문',
                        instructor: '김나영',
                        level: '입문',
                        rating: 4.6,
                        reviews: 298,
                        tag: '기획',
                    },
                    {
                        title: '사용자 경험 설계',
                        instructor: '박지민',
                        level: '초급',
                        rating: 4.8,
                        reviews: 345,
                        tag: 'UX/UI',
                    },
                    {
                        title: '애자일 방법론 실무',
                        instructor: '이준호',
                        level: '중급',
                        rating: 4.7,
                        reviews: 412,
                        tag: '기획',
                    },
                    {
                        title: '데이터 기반 의사결정',
                        instructor: '정예진',
                        level: '초급',
                        rating: 4.5,
                        reviews: 267,
                        tag: '기획',
                    },
                    {
                        title: '프로젝트 관리 마스터',
                        instructor: '최성민',
                        level: '중급',
                        rating: 4.9,
                        reviews: 389,
                        tag: '관리',
                    },
                    {
                        title: '시장 조사 및 분석',
                        instructor: '김하늘',
                        level: '초급',
                        rating: 4.6,
                        reviews: 234,
                        tag: '기획',
                    },
                ]
            case 'design':
                return [
                    {
                        title: 'UI/UX 디자인 기초',
                        instructor: '박소연',
                        level: '입문',
                        rating: 4.7,
                        reviews: 456,
                        tag: '디자인',
                    },
                    {
                        title: 'Figma 실전 디자인',
                        instructor: '이민수',
                        level: '초급',
                        rating: 4.8,
                        reviews: 523,
                        tag: '디자인',
                    },
                    {
                        title: '브랜딩 디자인 전략',
                        instructor: '김지현',
                        level: '중급',
                        rating: 4.6,
                        reviews: 289,
                        tag: '디자인',
                    },
                    {
                        title: '모션 그래픽스',
                        instructor: '정우진',
                        level: '초급',
                        rating: 4.5,
                        reviews: 198,
                        tag: '디자인',
                    },
                    {
                        title: '웹 디자인 트렌드',
                        instructor: '최예린',
                        level: '중급',
                        rating: 4.9,
                        reviews: 367,
                        tag: '디자인',
                    },
                    {
                        title: '프로토타이핑 실무',
                        instructor: '오지영',
                        level: '초급',
                        rating: 4.7,
                        reviews: 312,
                        tag: '디자인',
                    },
                ]
            default:
                return []
        }
    }

    const cards = getCardsByCategory(category)

    return (
        <div className="grid w-full grid-cols-1 gap-4 mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards.map((card) => (
                <article
                    key={card.title}
                    onClick={() => window.location.href = '/course-detail'}
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

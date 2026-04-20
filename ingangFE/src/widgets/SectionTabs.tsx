type SectionTabsProps = {
  activeTab: 'intro' | 'curriculum' | 'reviews'
  onTabChange: (tab: 'intro' | 'curriculum' | 'reviews') => void
}

const tabs = [
  { id: 'intro', label: '강의 소개' },
  { id: 'curriculum', label: '커리큘럼' },
  { id: 'reviews', label: '후기' },
] as const

const SectionTabs = ({ activeTab, onTabChange }: SectionTabsProps) => (
  <div className="sticky top-0 z-10 bg-white border-b">
    <div className="px-4 mx-auto max-w-7xl">
      <nav className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  </div>
)

export default SectionTabs

import DashboardHeader from '@/components/layout/DashboardHeader';
import FeatureCard from '@/components/ui/FeatureCard';
import NewsCard from '@/components/ui/NewsCard';

export default function HomePage() {
  const features = [
    { href: '/content/today', icon: '📅', label: '今天內容' },
    { href: '/share', icon: '✏️', label: '分享心得' },
    { href: '/quiz', icon: '🖥️', label: '測一測' },
    { href: '/food', icon: '🍴', label: '食過什麼' },
    { href: '/records', icon: '📊', label: '21天記錄' },
    { href: '/buddyshare', icon: '👥', label: '同學分享' },
  ];

  const sampleNews = [
    {
      title: '歡迎參加第21期學習計劃',
      description: '讓我們一起開始21天的營養學習之旅',
    },
    {
      title: '每日提醒',
      description: '記得完成今天的閱讀和測驗',
    },
  ];

  return (
    <div>
      <DashboardHeader period={21} />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.href}
              href={feature.href}
              icon={feature.icon}
              label={feature.label}
            />
          ))}
        </div>

        {/* News Section */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-2 border-b-2 border-gray-300 pb-2">
            最新消息
          </h2>
          <div className="space-y-3">
            {sampleNews.map((news, index) => (
              <NewsCard
                key={index}
                title={news.title}
                description={news.description}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}


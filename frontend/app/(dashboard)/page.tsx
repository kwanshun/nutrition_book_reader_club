'use client';

import DashboardHeader from '@/components/layout/DashboardHeader';
import FeatureCard from '@/components/ui/FeatureCard';

export default function DashboardPage() {
  const features = [
    { href: '/content/today', icon: '/icon/today-content.svg', label: '今天內容', gradient: 'from-blue-500 to-purple-600', description: '每日營養知識' },
    { href: '/share', icon: '/icon/sharing.svg', label: '分享心得', gradient: 'from-green-500 to-teal-600', description: '記錄學習心得' },
    { href: '/quiz', icon: '/icon/quiz.svg', label: '測一測', gradient: 'from-orange-500 to-red-600', description: '知識小測驗' },
    { href: '/food', icon: '/icon/food.svg', label: '食物識別', gradient: 'from-yellow-500 to-amber-600', description: '拍照識別食物' },
    { href: '/records', icon: '/icon/calendar-summary.svg', label: '21天記錄', gradient: 'from-pink-500 to-rose-600', description: '學習進度總覽' },
    { href: '/book', icon: '/book-cover.jpg', label: '書籍介紹', gradient: 'from-indigo-500 to-violet-600', description: '了解本書內容' }
  ];

  const sampleNews = [
    {
      title: '歡迎參加第21期學習計劃',
      description: '讓我們一起開始21天的營養學習之旅',
      type: 'welcome',
      date: '今天'
    },
    {
      title: '每日提醒',
      description: '記得完成今天的閱讀和測驗',
      type: 'reminder',
      date: '2小時前'
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <DashboardHeader period={21} />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            歡迎回來！
          </h1>
          <p className="text-sm font-medium text-gray-700 mb-1">
            第21期 - 營養人生讀書會
          </p>
          <p className="text-sm text-gray-600">
            繼續你的營養學習之旅
          </p>
        </div>

        {/* Feature Cards Grid - Enhanced */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.href}
              href={feature.href}
              icon={feature.icon}
              label={feature.label}
              description={feature.description}
              gradient={feature.gradient}
              variant="gradient"
            />
          ))}
        </div>


        {/* News Section - Enhanced */}
        <section>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 mr-2">最新消息</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
          </div>
          
          <div className="space-y-3">
            {sampleNews.map((news, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">
                      {news.title}
                    </h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {news.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {news.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}


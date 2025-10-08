'use client';

import DashboardHeader from '@/components/layout/DashboardHeader';

export default function BookPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <DashboardHeader period={21} />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Book Cover Section */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            <img 
              src="/book-cover.jpg" 
              alt="吃的營養 科學觀 - 書籍封面"
              className="w-19 h-30 rounded-lg border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">書籍封面</div>';
                }
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">吃的營養 科學觀</h1>
          <p className="text-gray-600 text-sm">第21期營養人生讀書會指定教材</p>
        </div>

        {/* Book Information */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">書籍簡介</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              這本書深入探討營養科學的基礎知識，幫助讀者建立正確的營養觀念。透過科學的角度，讓我們了解食物如何影響我們的身體健康，以及如何做出明智的飲食選擇。
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">學習目標</h2>
            <ul className="text-gray-700 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-teal-500 mr-2">•</span>
                了解營養素的基本功能和作用
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-2">•</span>
                學會如何平衡日常飲食
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-2">•</span>
                掌握食物選擇的科學原則
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-2">•</span>
                建立健康的飲食習慣
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">閱讀建議</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              建議每天閱讀一個章節，並配合每日的測驗和分享活動，讓學習更加深入。記得在分享頁面記錄你的學習心得，與同學們一起交流討論。
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors">
            開始閱讀
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            查看學習進度
          </button>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          營養書讀書會
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          21天營養書閱讀計劃
        </p>
        
        <div className="card max-w-md mx-auto">
          <p className="text-gray-700 mb-6">
            ✅ Next.js 已設置完成<br/>
            ✅ Supabase 客戶端已準備好<br/>
            ✅ TypeScript 類型已定義<br/>
            ✅ 繁體中文支援已啟用
          </p>
          
          <div className="space-y-3">
            <button className="btn-primary w-full">
              開始閱讀
            </button>
            <button className="btn-secondary w-full">
              查看進度
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          準備開始建立登入頁面和內容顯示功能
        </p>
      </div>
    </div>
  );
}

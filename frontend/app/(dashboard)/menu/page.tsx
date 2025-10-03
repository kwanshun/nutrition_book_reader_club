import DashboardHeader from '@/components/layout/DashboardHeader';

export default function MenuPage() {
  return (
    <div>
      <DashboardHeader period={21} />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-blue-100 border-4 border-blue-400 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-blue-900">☰ 選單頁面</h1>
          <p className="text-lg text-blue-800">這是選單頁面！導航成功了！</p>
        </div>
      </main>
    </div>
  );
}


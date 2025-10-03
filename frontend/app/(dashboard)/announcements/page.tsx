import DashboardHeader from '@/components/layout/DashboardHeader';

export default function AnnouncementsPage() {
  return (
    <div>
      <DashboardHeader period={21} />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-yellow-100 border-4 border-yellow-400 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-yellow-900">📢 公告頁面</h1>
          <p className="text-lg text-yellow-800">這是公告頁面！導航成功了！</p>
        </div>
      </main>
    </div>
  );
}


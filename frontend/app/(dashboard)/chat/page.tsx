import DashboardHeader from '@/components/layout/DashboardHeader';

export default function ChatPage() {
  return (
    <div>
      <DashboardHeader period={21} />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-green-100 border-4 border-green-400 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-green-900">💬 聊天室頁面</h1>
          <p className="text-lg text-green-800">這是聊天室頁面！導航成功了！</p>
        </div>
      </main>
    </div>
  );
}


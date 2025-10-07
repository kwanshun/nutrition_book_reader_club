import BottomNav from '@/components/layout/BottomNav';
import UserNameBar from '@/components/layout/UserNameBar';
import AuthWrapper from '@/components/auth/AuthWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <UserNameBar period={21} />
        <main className="flex-1 pt-12 pb-16 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthWrapper>
  );
}


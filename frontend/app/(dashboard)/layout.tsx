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
      <div className="min-h-screen bg-gray-50 pb-16">
        <UserNameBar />
        <div className="pt-12">
          {children}
        </div>
        <BottomNav />
      </div>
    </AuthWrapper>
  );
}


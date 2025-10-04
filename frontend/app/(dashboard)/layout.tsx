import BottomNav from '@/components/layout/BottomNav';
import AuthWrapper from '@/components/auth/AuthWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50 pb-16">
        {children}
        <BottomNav />
      </div>
    </AuthWrapper>
  );
}


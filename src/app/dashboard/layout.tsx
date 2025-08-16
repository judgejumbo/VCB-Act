import { AuthGuard } from '@/components/auth/auth-guard';
import { Navigation } from '@/components/layout/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        {children}
      </div>
    </AuthGuard>
  );
}
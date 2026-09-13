import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { AdminLayout } from './AdminLayout';
import { AdminOverview } from './AdminOverview';
import { AdminStudents } from './AdminStudents';
import { AdminContent } from './AdminContent';
import { Button } from '../ui/button';

type AdminTab = 'overview' | 'students' | 'content';

export function AdminApp() {
  const { isLoaded, isSignedIn, user } = useSupabaseAuth();
  const [me, setMe] = useState<any>(undefined);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const email = user.email?.toLowerCase() || '';
      const isAdminUser = user.user_metadata?.role === 'admin' || email.startsWith('admin@') || email.includes('+admin@');
      setMe(isAdminUser ? { role: 'admin' } : null);
    } else if (isLoaded) {
      setMe(null);
    }
  }, [isSignedIn, user, isLoaded]);

  if (!isLoaded) return <AdminCentered message="Loading…" />;

  if (!isSignedIn) {
    return (
      <AdminCentered
        title="Admin Portal"
        message="Sign in with an authorised administrator account."
      >
        <Button onClick={() => window.location.search = '?choose'}>Go to Sign In</Button>
      </AdminCentered>
    );
  }

  if (me === undefined) return <AdminCentered message="Checking permissions…" />;

  if (me?.role !== 'admin') {
    return (
      <AdminCentered
        title="Not authorised"
        message={`${user?.email ?? 'This account'} does not have administrator access. Ask an existing admin to grant the admin role.`}
      />
    );
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && <AdminOverview />}
      {activeTab === 'students' && <AdminStudents />}
      {activeTab === 'content' && <AdminContent />}
    </AdminLayout>
  );
}

function AdminCentered({
  title,
  message,
  children,
}: {
  title?: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">
          WARP
        </p>
        {title && (
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        )}
        <p className="text-sm text-foreground-secondary">{message}</p>
        {children}
      </div>
    </div>
  );
}

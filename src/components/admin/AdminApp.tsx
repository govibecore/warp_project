import { useState } from 'react';
import { SignIn, useAuth, useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from './AdminLayout';
import { AdminOverview } from './AdminOverview';
import { AdminStudents } from './AdminStudents';
import { AdminContent } from './AdminContent';

type AdminTab = 'overview' | 'students' | 'content';

/**
 * The admin portal is gated on the Clerk session plus the `role` field stored
 * in Convex. Access is never decided in the browser: the admin queries
 * themselves re-check the role server-side, so this screen is only a UX gate.
 */
export function AdminApp() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const me = useQuery(api.users.current);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (!isLoaded) return <AdminCentered message="Loading…" />;

  if (!isSignedIn) {
    return (
      <AdminCentered
        title="Admin Portal"
        message="Sign in with an authorised administrator account."
      >
        <SignIn routing="hash" />
      </AdminCentered>
    );
  }

  if (me === undefined) return <AdminCentered message="Checking permissions…" />;

  if (me?.role !== 'admin') {
    return (
      <AdminCentered
        title="Not authorised"
        message={`${user?.primaryEmailAddress?.emailAddress ?? 'This account'} does not have administrator access. Ask an existing admin to grant the admin role.`}
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

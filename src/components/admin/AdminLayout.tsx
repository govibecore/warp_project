import { type ReactNode } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { signOutUser } from '../../lib/auth';
import { BarChart3, GraduationCap, Library, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AdminTab = 'overview' | 'students' | 'content';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="size-4" /> },
  { id: 'students', label: 'Students', icon: <GraduationCap className="size-4" /> },
  { id: 'content', label: 'Content', icon: <Library className="size-4" /> },
];

export function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const { user } = useSupabaseAuth();

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-6 py-5">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Control Panel
          </p>
          <h1 className="font-display text-lg font-bold tracking-tight">WARP Admin</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground-secondary hover:bg-accent hover:text-foreground',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex size-8 items-center justify-center bg-primary/15 text-sm font-semibold text-primary">
              {(user?.email ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 text-xs">
              <p className="truncate font-semibold">{user?.email?.split('@')[0] ?? 'Admin'}</p>
              <p className="truncate text-foreground-secondary">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOutUser()}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-secondary transition-colors hover:bg-accent hover:text-destructive"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

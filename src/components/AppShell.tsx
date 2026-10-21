import React from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  headerRightAction?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  showHeader = true,
  showNav = true,
  headerTitle,
  headerSubtitle,
  headerRightAction,
}) => {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col antialiased selection:bg-brand-soft">
      {showHeader && (
        <AppHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          rightAction={headerRightAction}
        />
      )}

      <main className={`flex-1 w-full max-w-md mx-auto px-4 pt-3 ${showNav ? 'pb-28' : 'pb-8'}`}>
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
};

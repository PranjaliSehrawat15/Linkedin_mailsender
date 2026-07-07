import { useLocation } from 'react-router-dom';
import { Bell, Settings, User } from 'lucide-react';

const pageTitles = {
  '/': 'Dashboard',
  '/search': 'Search Jobs',
  '/recruiters': 'Recruiters',
  '/resume': 'Resume',
  '/email': 'Email Outreach',
  '/history': 'History',
};

export default function Navbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 flex items-center justify-between px-8">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-xs text-surface-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <button
          className="relative p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/60 transition-all"
          title="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        <button
          className="p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/60 transition-all"
          title="Settings"
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>

        <div className="ml-2 flex items-center gap-3 pl-4 border-l border-surface-700/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-surface-300 hidden sm:block">User</span>
        </div>
      </div>
    </header>
  );
}

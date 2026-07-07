import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Users,
  FileText,
  Mail,
  History,
  Link,
  Zap,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search', icon: Search, label: 'Search Jobs' },
  { to: '/recruiters', icon: Users, label: 'Recruiters' },
  { to: '/resume', icon: FileText, label: 'Resume' },
  { to: '/email', icon: Mail, label: 'Email' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-900/80 backdrop-blur-xl border-r border-surface-700/50 flex flex-col z-40">
      {/* Brand */}
      <div className="p-6 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-primary-500 to-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/20">
            <Link className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">JobOutreach</h1>
            <p className="text-xs text-surface-400">Automation Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
              ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? 'text-primary-400' : 'text-surface-500 group-hover:text-surface-300'
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-glow" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-surface-700/50">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-warning-400" />
            <span className="text-xs font-semibold text-warning-400">Pro Tip</span>
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            Use specific keywords like "Java Developer hiring" for better results.
          </p>
        </div>
      </div>
    </aside>
  );
}

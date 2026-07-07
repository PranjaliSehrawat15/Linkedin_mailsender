import { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Mail,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getAnalytics, getHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [analyticsRes, historyRes] = await Promise.all([getAnalytics(), getHistory()]);
      setAnalytics(analyticsRes.data.data);
      setRecentSearches(historyRes.data.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const stats = [
    {
      label: 'Total Searches',
      value: analytics?.totalSearches || 0,
      icon: Search,
      color: 'from-primary-500 to-primary-700',
      bgColor: 'bg-primary-500/10',
      textColor: 'text-primary-400',
    },
    {
      label: 'Recruiters Found',
      value: analytics?.totalRecruiters || 0,
      icon: Users,
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-500/10',
      textColor: 'text-accent-400',
    },
    {
      label: 'Emails Sent',
      value: analytics?.totalEmails || 0,
      icon: Mail,
      color: 'from-warning-400 to-warning-500',
      bgColor: 'bg-warning-400/10',
      textColor: 'text-warning-400',
    },
    {
      label: "Today's Searches",
      value: analytics?.todaySearches || 0,
      icon: TrendingUp,
      color: 'from-danger-400 to-danger-500',
      bgColor: 'bg-danger-400/10',
      textColor: 'text-danger-400',
    },
  ];

  // Prepare chart data with fallback
  const weeklySearchData = analytics?.weeklySearches?.length
    ? analytics.weeklySearches.map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        searches: d.count,
      }))
    : [
        { date: 'Mon', searches: 0 },
        { date: 'Tue', searches: 0 },
        { date: 'Wed', searches: 0 },
        { date: 'Thu', searches: 0 },
        { date: 'Fri', searches: 0 },
      ];

  const weeklyEmailData = analytics?.weeklyEmails?.length
    ? analytics.weeklyEmails.map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        emails: d.count,
      }))
    : [
        { date: 'Mon', emails: 0 },
        { date: 'Tue', emails: 0 },
        { date: 'Wed', emails: 0 },
        { date: 'Thu', emails: 0 },
        { date: 'Fri', emails: 0 },
      ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-accent-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Updated just now</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Searches Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-4">Weekly Searches</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklySearchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="searches" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Emails Sent Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-4">Emails Sent</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyEmailData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '13px',
                }}
              />
              <Line
                type="monotone"
                dataKey="emails"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-semibold text-white mb-4">Recent Searches</h3>
        {recentSearches.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-10 h-10 text-surface-600 mx-auto mb-3" />
            <p className="text-surface-400 text-sm">No searches yet. Start your first search!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-surface-400 uppercase tracking-wider border-b border-surface-700/50">
                  <th className="text-left py-3 px-4">Keyword</th>
                  <th className="text-left py-3 px-4">Results</th>
                  <th className="text-left py-3 px-4">Emails Sent</th>
                  <th className="text-left py-3 px-4">Duration</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSearches.map((search) => (
                  <tr
                    key={search.id}
                    className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-white">{search.keyword}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-primary-400 font-semibold">
                        {search.results}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-accent-400">{search.emailsSent}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-surface-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {search.duration}s
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-surface-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(search.searchTime).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

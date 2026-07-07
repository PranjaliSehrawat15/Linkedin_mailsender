import { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Mail, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { getHistory, getEmailHistory } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('searches');
  const [searches, setSearches] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [searchRes, emailRes] = await Promise.all([
        getHistory(),
        getEmailHistory(),
      ]);
      setSearches(searchRes.data.data || []);
      setEmails(emailRes.data.data || []);
    } catch (err) {
      addToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading history..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-500/10">
            <HistoryIcon className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Activity History</h3>
            <p className="text-sm text-surface-400">View past searches and emails sent</p>
          </div>
        </div>

        <div className="flex bg-surface-800/50 p-1 rounded-xl border border-surface-700/50 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('searches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'searches'
                ? 'bg-surface-700 text-white shadow-sm'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Searches ({searches.length})
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'emails'
                ? 'bg-surface-700 text-white shadow-sm'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            Emails ({emails.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {activeTab === 'searches' ? (
          searches.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-surface-600 mx-auto mb-4" />
              <p className="text-surface-400">No search history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-surface-400 uppercase tracking-wider bg-surface-800/50 border-b border-surface-700/50">
                    <th className="text-left py-4 px-6">Keyword</th>
                    <th className="text-left py-4 px-6">Results Found</th>
                    <th className="text-left py-4 px-6">Emails Sent</th>
                    <th className="text-left py-4 px-6">Duration</th>
                    <th className="text-left py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {searches.map((search) => (
                    <tr
                      key={search.id}
                      className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary-500/15 text-primary-400 border border-primary-500/20">
                          {search.keyword}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-white font-semibold">
                        {search.results}
                      </td>
                      <td className="py-4 px-6 text-sm text-accent-400 font-medium">
                        {search.emailsSent}
                      </td>
                      <td className="py-4 px-6 text-sm text-surface-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {search.duration}s
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-surface-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(search.searchTime).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          emails.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="w-12 h-12 text-surface-600 mx-auto mb-4" />
              <p className="text-surface-400">No email history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-surface-400 uppercase tracking-wider bg-surface-800/50 border-b border-surface-700/50">
                    <th className="text-left py-4 px-6">Sent To</th>
                    <th className="text-left py-4 px-6">Subject</th>
                    <th className="text-left py-4 px-6">Status</th>
                    <th className="text-left py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr
                      key={email.id}
                      className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-white">{email.recruiterName || 'Unknown'}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{email.recruiterEmail || 'No email'}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{email.recruiterCompany || ''}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-surface-300 max-w-xs truncate" title={email.subject}>
                        {email.subject}
                      </td>
                      <td className="py-4 px-6">
                        {email.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-500/15 text-accent-400 border border-accent-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger-400/15 text-danger-400 border border-danger-400/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-surface-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {email.sentAt ? new Date(email.sentAt).toLocaleString() : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

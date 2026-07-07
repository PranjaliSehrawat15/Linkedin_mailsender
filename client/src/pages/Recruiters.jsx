import { useState, useEffect } from 'react';
import { Users, Trash2, Mail, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import { getRecruiters, deleteRecruiter, getResumes, sendEmail, getEmailTemplate } from '../services/api';
import { useToast } from '../components/Toast';
import EmailModal from '../components/EmailModal';
import LoadingSpinner from '../components/LoadingSpinner';

const statusColors = {
  new: 'bg-primary-500/15 text-primary-400 border-primary-500/20',
  contacted: 'bg-accent-500/15 text-accent-400 border-accent-500/20',
  replied: 'bg-warning-400/15 text-warning-400 border-warning-400/20',
  rejected: 'bg-danger-400/15 text-danger-400 border-danger-400/20',
};

export default function RecruitersPage() {
  const [recruiters, setRecruiters] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailModal, setEmailModal] = useState({ open: false, recruiter: null });
  const [sending, setSending] = useState(false);
  const [template, setTemplate] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [recRes, resRes, tmplRes] = await Promise.all([
        getRecruiters(),
        getResumes(),
        getEmailTemplate(),
      ]);
      setRecruiters(recRes.data.data || []);
      setResumes(resRes.data.data || []);
      setTemplate(tmplRes.data.data || null);
    } catch (err) {
      addToast('Failed to load recruiters', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this recruiter?')) return;
    try {
      await deleteRecruiter(id);
      setRecruiters((prev) => prev.filter((r) => r.id !== id));
      addToast('Recruiter deleted', 'success');
    } catch {
      addToast('Failed to delete', 'error');
    }
  }

  async function handleSendEmail(data) {
    setSending(true);
    try {
      await sendEmail(data);
      addToast('Email sent successfully!', 'success');
      setEmailModal({ open: false, recruiter: null });
      fetchData(); // Refresh to update status
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send email', 'error');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading recruiters..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Recruiter Management</h3>
          <p className="text-sm text-surface-400">{recruiters.length} recruiter(s) in database</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800 text-surface-300 hover:text-white border border-surface-700 hover:border-surface-600 text-sm font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {recruiters.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 mb-1">No recruiters found yet</p>
            <p className="text-xs text-surface-500">Run a search to find recruiters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-surface-400 uppercase tracking-wider bg-surface-800/50">
                  <th className="text-left py-4 px-5">Name</th>
                  <th className="text-left py-4 px-5">Company</th>
                  <th className="text-left py-4 px-5">Email</th>
                  <th className="text-left py-4 px-5">Status</th>
                  <th className="text-left py-4 px-5">Date</th>
                  <th className="text-right py-4 px-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map((recruiter) => (
                  <tr
                    key={recruiter.id}
                    className="border-t border-surface-800/50 hover:bg-surface-800/30 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <span className="text-sm font-medium text-white">{recruiter.name || 'Unknown'}</span>
                    </td>
                    <td className="py-4 px-5 text-sm text-surface-300">
                      {recruiter.company || 'N/A'}
                    </td>
                    <td className="py-4 px-5 text-sm">
                      {recruiter.email ? (
                        <span className="text-accent-400">{recruiter.email}</span>
                      ) : (
                        <span className="text-surface-500 italic">Not found</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          statusColors[recruiter.status] || statusColors.new
                        }`}
                      >
                        {recruiter.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-sm text-surface-400">
                      {new Date(recruiter.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-1">
                        {recruiter.linkedinPost && (
                          <a
                            href={recruiter.linkedinPost}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                            title="View Post"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {recruiter.email && (
                          <button
                            onClick={() =>
                              setEmailModal({ open: true, recruiter })
                            }
                            className="p-2 rounded-lg text-surface-400 hover:text-accent-400 hover:bg-accent-500/10 transition-all"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(recruiter.id)}
                          className="p-2 rounded-lg text-surface-400 hover:text-danger-400 hover:bg-danger-400/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Modal */}
      <EmailModal
        isOpen={emailModal.open}
        onClose={() => setEmailModal({ open: false, recruiter: null })}
        recruiter={emailModal.recruiter}
        resumes={resumes}
        onSend={handleSendEmail}
        template={template}
        loading={sending}
      />
    </div>
  );
}

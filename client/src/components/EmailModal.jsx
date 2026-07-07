import { useState } from 'react';
import { X, Send, Paperclip, Loader2 } from 'lucide-react';

export default function EmailModal({
  isOpen,
  onClose,
  recruiter,
  resumes,
  onSend,
  template,
  loading,
}) {
  const [subject, setSubject] = useState(template?.subject || 'Application for Frontend Developer Role');
  const [body, setBody] = useState(template?.body || '');
  const [selectedResumeId, setSelectedResumeId] = useState(resumes?.[0]?.id || '');

  if (!isOpen) return null;

  const handleSend = () => {
    onSend({
      recruiterId: recruiter.id,
      subject,
      body,
      resumeId: selectedResumeId || undefined,
      method: 'nodemailer',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-surface-900 rounded-2xl border border-surface-700/50 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-700/50">
          <div>
            <h3 className="text-lg font-semibold text-white">Compose Email</h3>
            <p className="text-sm text-surface-400 mt-0.5">
              To: {recruiter?.name} ({recruiter?.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all resize-none"
            />
          </div>

          {/* Resume Attachment */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              <Paperclip className="w-4 h-4 inline mr-1" />
              Attach Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
            >
              <option value="">No attachment</option>
              {resumes?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.originalName} ({(r.size / 1024).toFixed(1)} KB)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-700/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !subject || !body}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}

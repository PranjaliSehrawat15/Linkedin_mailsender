import { useState, useEffect } from 'react';
import { Mail, Save, Eye, EyeOff } from 'lucide-react';
import { getEmailTemplate, getSettings } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EmailPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Your Name');
  const [position, setPosition] = useState('Frontend Developer');
  const { addToast } = useToast();

  useEffect(() => {
    fetchTemplateAndSettings();
  }, []);

  async function fetchTemplateAndSettings() {
    setLoading(true);
    try {
      const [tmplRes, settingsRes] = await Promise.all([
        getEmailTemplate(),
        getSettings()
      ]);
      const tmpl = tmplRes.data.data;
      const settings = settingsRes.data.data;
      
      setSubject(tmpl.subject || '');
      setBody(tmpl.body || '');
      if (settings && settings.userName) {
        setUserName(settings.userName);
      }
    } catch {
      addToast('Failed to load template or settings', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getPreviewText(text) {
    return text.replace(/{Name}/g, userName).replace(/{Position}/g, position);
  }

  function handleSave() {
    addToast('Template saved locally!', 'success');
  }

  if (loading) return <LoadingSpinner text="Loading template..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-500/10">
            <Mail className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Email Template</h3>
            <p className="text-sm text-surface-400">Customize your outreach email</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800 text-surface-300 hover:text-white border border-surface-700 hover:border-surface-600 text-sm font-medium transition-all"
          >
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 transition-all hover:from-primary-500 hover:to-primary-400"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>

      {/* Variables */}
      <div className="glass-card p-5 rounded-xl">
        <h4 className="text-sm font-semibold text-surface-300 mb-3">Template Variables</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-surface-400 mb-1">{'{Name}'} — Your name</label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1">
              {'{Position}'} — Job title
            </label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-sm font-semibold text-surface-300 mb-4">
            {preview ? 'Template (Raw)' : 'Edit Template'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-surface-400 mb-1.5">Subject Line</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
                readOnly={preview}
              />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1.5">Email Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all resize-none font-mono leading-relaxed"
                readOnly={preview}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-sm font-semibold text-surface-300 mb-4">Live Preview</h4>
          <div className="bg-surface-800/50 rounded-xl p-6 border border-surface-700/50">
            <div className="border-b border-surface-700/50 pb-4 mb-4 space-y-2">
              <div className="flex gap-2">
                <span className="text-xs text-surface-500 w-16">From:</span>
                <span className="text-xs text-surface-300">you@gmail.com</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-surface-500 w-16">To:</span>
                <span className="text-xs text-surface-300">recruiter@company.com</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-surface-500 w-16">Subject:</span>
                <span className="text-xs text-white font-medium">
                  {getPreviewText(subject)}
                </span>
              </div>
            </div>
            <div className="text-sm text-surface-200 whitespace-pre-wrap leading-relaxed">
              {getPreviewText(body)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

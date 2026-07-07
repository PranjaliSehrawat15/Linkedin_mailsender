import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Lock, Mail, User, Link, Key } from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    linkedinEmail: '',
    linkedinPassword: '',
    gmailEmail: '',
    gmailAppPassword: '',
    userName: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await getSettings();
      const settings = res.data.data;
      if (settings) {
        setFormData({
          linkedinEmail: settings.linkedinEmail || '',
          linkedinPassword: '', // Don't pre-fill password for security
          gmailEmail: settings.gmailEmail || '',
          gmailAppPassword: '', // Don't pre-fill password
          userName: settings.userName || '',
        });
      }
    } catch {
      addToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      addToast('Settings saved successfully', 'success');
      // Clear password fields after save
      setFormData(prev => ({
        ...prev,
        linkedinPassword: '',
        gmailAppPassword: ''
      }));
    } catch {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading settings..." />;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary-500/10">
          <SettingsIcon className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Application Settings</h3>
          <p className="text-sm text-surface-400">Configure your credentials for automation</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Settings */}
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-accent-400" />
            Profile Info
          </h4>
          <div className="grid gap-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Your Full Name (used in emails)
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* LinkedIn Settings */}
        <div className="glass-card p-6 rounded-2xl border border-primary-500/20">
          <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Link className="w-4 h-4 text-primary-400" />
            LinkedIn Credentials
          </h4>
          <p className="text-xs text-surface-400 mb-4">
            Required for Playwright to log in and search for job posts. Your password is only stored locally.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                LinkedIn Email
              </label>
              <input
                type="email"
                name="linkedinEmail"
                value={formData.linkedinEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                LinkedIn Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="linkedinPassword"
                  value={formData.linkedinPassword}
                  onChange={handleChange}
                  placeholder={formData.linkedinEmail ? "•••••••• (Saved)" : "Enter password"}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Gmail Settings */}
        <div className="glass-card p-6 rounded-2xl border border-danger-400/20">
          <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-danger-400" />
            Gmail Credentials
          </h4>
          <p className="text-xs text-surface-400 mb-4">
            Required for sending emails. For security, please use a Google App Password rather than your real password.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Gmail Address
              </label>
              <input
                type="email"
                name="gmailEmail"
                value={formData.gmailEmail}
                onChange={handleChange}
                placeholder="you@gmail.com"
                className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-danger-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5 flex items-center gap-1.5">
                App Password
                <a href="https://support.google.com/accounts/answer/185833?hl=en" target="_blank" rel="noreferrer" className="text-xs text-danger-400 hover:underline">
                  (How to get this)
                </a>
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="gmailAppPassword"
                  value={formData.gmailAppPassword}
                  onChange={handleChange}
                  placeholder={formData.gmailEmail ? "•••••••• (Saved)" : "16-letter app password"}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-danger-500 transition-all"
                />
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/20 transition-all hover:from-primary-500 hover:to-primary-400 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

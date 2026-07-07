import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Download, File, CheckCircle2 } from 'lucide-react';
import { uploadResume, getResumes, deleteResume } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResumePage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    setLoading(true);
    try {
      const res = await getResumes();
      setResumes(res.data.data || []);
    } catch {
      addToast('Failed to load resumes', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file) {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      addToast('Only PDF and DOCX files are allowed', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be under 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await uploadResume(formData);
      addToast('Resume uploaded successfully!', 'success');
      fetchResumes();
    } catch (err) {
      addToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this resume?')) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      addToast('Resume deleted', 'success');
    } catch {
      addToast('Failed to delete resume', 'error');
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  if (loading) return <LoadingSpinner text="Loading resumes..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upload Area */}
      <div
        className={`glass-card p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? 'border-primary-500 bg-primary-500/5'
            : 'border-surface-700 hover:border-surface-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <Upload className={`w-7 h-7 text-primary-400 ${uploading ? 'animate-bounce' : ''}`} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            {uploading ? 'Uploading...' : 'Upload Your Resume'}
          </h3>
          <p className="text-sm text-surface-400 mb-3">
            Drag & drop or click to browse
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-surface-500">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              PDF, DOCX
            </span>
            <span>Max 5MB</span>
          </div>
        </div>
      </div>

      {/* Uploaded Resumes */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4">
          Uploaded Resumes ({resumes.length})
        </h3>

        {resumes.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <File className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 mb-1">No resumes uploaded yet</p>
            <p className="text-xs text-surface-500">Upload a resume to attach to emails</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {resumes.map((resume) => (
              <div key={resume.id} className="glass-card p-5 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-danger-400/10 shrink-0">
                    <FileText className="w-6 h-6 text-danger-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {resume.originalName}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                      <span>{formatSize(resume.size)}</span>
                      <span>•</span>
                      <span>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                      <span className="text-xs text-accent-400">Ready to attach</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/resumes/${resume.id}/download`}
                      className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-2 rounded-lg text-surface-400 hover:text-danger-400 hover:bg-danger-400/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

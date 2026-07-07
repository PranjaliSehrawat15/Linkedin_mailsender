import { useState } from 'react';
import { Search as SearchIcon, Loader2, Users, Globe, Clock, Sparkles } from 'lucide-react';
import { startSearch } from '../services/api';
import { useToast } from '../components/Toast';

const suggestedKeywords = [
  'Java Developer',
  'React Developer',
  'Frontend Developer',
  'NodeJS Developer',
  'Python Developer',
  'Data Analyst',
  'DevOps Engineer',
  'UI/UX Designer',
  'Internship',
  'Contract',
];

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const { addToast } = useToast();

  async function handleSearch(e) {
    e.preventDefault();
    if (!keyword.trim()) {
      addToast('Please enter a keyword', 'error');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const res = await startSearch(keyword.trim());
      setResults(res.data.data);
      addToast(res.data.data.message || 'Search completed!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search Form */}
      <div className="glass-card p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary-500/10">
            <SearchIcon className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Search LinkedIn Posts</h3>
            <p className="text-sm text-surface-400">
              Enter keywords to find job posts from the last 24 hours
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-5">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., Java Developer, React Internship, Frontend Contract..."
              className="w-full pl-12 pr-4 py-4 bg-surface-800/60 border border-surface-700 rounded-2xl text-white text-base placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              disabled={loading}
            />
          </div>

          {/* Suggested Keywords */}
          <div>
            <p className="text-xs text-surface-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Suggested Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setKeyword(kw)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    keyword === kw
                      ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                      : 'bg-surface-800/60 text-surface-400 border-surface-700 hover:border-surface-600 hover:text-surface-300'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching LinkedIn... This may take a minute
              </>
            ) : (
              <>
                <SearchIcon className="w-5 h-5" />
                Start Search
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-surface-700" />
            <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
          </div>
          <h4 className="text-base font-semibold text-white mb-2">Automation Running</h4>
          <p className="text-sm text-surface-400 max-w-md mx-auto">
            Playwright is launching a browser, logging into LinkedIn, searching posts, and extracting
            recruiter information. You may see a browser window open.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-surface-500">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent-400" />
              Opening LinkedIn
            </span>
            <span className="flex items-center gap-1.5">
              <SearchIcon className="w-3.5 h-3.5 text-primary-400" />
              Searching Posts
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-warning-400" />
              Extracting Data
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="glass-card p-6 rounded-2xl animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white">Search Results</h3>
              <p className="text-sm text-surface-400 mt-0.5">
                Found {results.recruiters?.length || 0} recruiter(s) • Duration: {results.duration}s
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-500/15 text-accent-400 border border-accent-500/20">
              {results.keyword}
            </span>
          </div>

          {results.recruiters?.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400 text-sm">
                No recruiters found. Try different keywords.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-surface-400 uppercase tracking-wider border-b border-surface-700/50">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Company</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Post</th>
                  </tr>
                </thead>
                <tbody>
                  {results.recruiters.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-white">
                        {r.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-sm text-surface-300">
                        {r.company || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {r.email ? (
                          <span className="text-accent-400">{r.email}</span>
                        ) : (
                          <span className="text-surface-500 italic">Not found</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {r.postUrl ? (
                          <a
                            href={r.postUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            View Post ↗
                          </a>
                        ) : (
                          <span className="text-surface-500">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

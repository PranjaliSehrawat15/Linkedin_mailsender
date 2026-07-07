import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/Search';
import RecruitersPage from './pages/Recruiters';
import ResumePage from './pages/Resume';
import EmailPage from './pages/Email';
import HistoryPage from './pages/History';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="flex min-h-screen bg-surface-950">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 ml-64 flex flex-col min-h-screen">
            {/* Top Navigation */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/recruiters" element={<RecruitersPage />} />
                  <Route path="/resume" element={<ResumePage />} />
                  <Route path="/email" element={<EmailPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;

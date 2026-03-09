import React, { useState, useEffect } from 'react'
import RegistrationForm from './components/RegistrationForm'
import TrackingDashboard from './components/TrackingDashboard'
import TrackSearch from './components/TrackSearch'
import AdminDashboard from './components/AdminDashboard'
import TechnicianDashboard from './components/TechnicianDashboard'
import AuthPage from './components/AuthPage'
import ChatBot from './components/ChatBot'
import './index.css'
import { Zap, History, Search, PlusCircle, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null);
  const [complaintData, setComplaintData] = useState(null);
  const [view, setView] = useState('register');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setComplaintData(null);
    setView('register');
  };

  const handleBack = () => {
    setComplaintData(null);
    setView('register');
  };

  if (!user) {
    return (
      <div className="app-container fade-in-up">
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem' }}>UrbanCare</h1>
          <p className="subtitle" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Secure Cloud-Based Management System</p>
        </header>
        <AuthPage onAuthSuccess={setUser} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{ marginBottom: '60px', textAlign: 'center' }} className="fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <UserIcon size={14} /> <span>{user.name} ({user.role})</span>
          </div>
          <button onClick={handleLogout} className="nav-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <LogOut size={12} /> Logout
          </button>
        </div>

        <h1 style={{ fontSize: '3.5rem' }}>UrbanCare</h1>
        <p className="subtitle" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{user.role} Management Portal</p>

        <nav style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
          {user.role === 'User' ? (
            <>
              <button
                onClick={() => { setView('register'); setComplaintData(null); }}
                className={`nav-btn ${view === 'register' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <PlusCircle size={18} /> Register New
              </button>
              <button
                onClick={() => { setView('track'); setComplaintData(null); }}
                className={`nav-btn ${view === 'track' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Search size={18} /> Track Existing
              </button>
            </>
          ) : (
            <div className="nav-btn active" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} /> {user.role === 'Admin' ? 'System Administration' : 'Field Operations'}
            </div>
          )}
        </nav>
      </header>

      <main style={{
        display: user.role === 'User' ? 'grid' : 'block',
        gridTemplateColumns: user.role === 'User' ? 'minmax(400px, 1fr) 1fr' : '1fr',
        gap: '60px',
        alignItems: 'start'
      }}>
        {user.role === 'User' && (
          <div style={{ paddingRight: '40px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
              {view === 'register' ? 'Digital Support, Real-World Solutions.' : 'Track Your Request Status.'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
              {view === 'register'
                ? 'Welcome back! Register your appliance repair requests with our cloud-secured platform.'
                : 'Enter your unique Complaint ID generated during registration to track real-time progress.'}
            </p>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <History color="var(--accent)" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Centralized Tracking</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Monitor work progress and estimated completion days instantly.</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {user.role === 'Admin' ? (
            <AdminDashboard user={user} />
          ) : user.role === 'Technician' ? (
            <TechnicianDashboard user={user} />
          ) : user.role === 'User' && (complaintData ? (
            <TrackingDashboard data={complaintData} onBack={handleBack} />
          ) : view === 'register' ? (
            <RegistrationForm user={user} onSuccess={setComplaintData} />
          ) : (
            <TrackSearch onSearchResult={setComplaintData} />
          ))}
        </div>
      </main>

      <ChatBot />

      <footer className="fade-in-up" style={{ marginTop: '100px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--glass-border)', paddingTop: '40px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        <p>UrbanCare AI Service Ecosystem &copy; 2026</p>
      </footer>
    </div>
  )
}

export default App

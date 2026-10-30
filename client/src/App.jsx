import { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [queryGuardEnabled, setQueryGuardEnabled] = useState(false);
  const [responseLog, setResponseLog] = useState(null);
  const [errorLog, setErrorLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setResponseLog(null);
    setErrorLog(null);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, queryGuardEnabled })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setResponseLog(data);
      } else {
        setErrorLog(data);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorLog({ error: 'Server offline or database connection lost.' });
    }
  };

  const fillPayload = () => {
    setUsername("admin' OR '1'='1");
    setPassword("anything123");
  };

  const fillNormalUser = () => {
    setUsername("student1");
    setPassword("pass123");
  };

  const handleLogout = () => {
    setResponseLog(null);
    setErrorLog(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="portal-layout">
      {/* LEFT HERO / BRANDING PANEL */}
      <aside className="portal-sidebar">
        <div className="sidebar-content">
          <div className="portal-brand">
            <span className="brand-crest">🏛️</span>
            <h1>BMSCE Campus Portal</h1>
            <p className="brand-sub">Secure Academic Information System</p>
          </div>

          <div className="lab-control-panel">
            <h3>🛡️ QueryGuard Demonstration Hub</h3>
            <p>Use these controls to simulate baseline vulnerabilities or enforce secure parameterization for your lab assessment.</p>

            <div className="control-card">
              <span className="control-label">Security Shield Status</span>
              <label className={`toggle-switch-large ${queryGuardEnabled ? 'active' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={queryGuardEnabled} 
                  onChange={(e) => setQueryGuardEnabled(e.target.checked)} 
                />
                <span className="slider-text">
                  {queryGuardEnabled ? '🔒 QueryGuard ACTIVE (Secure)' : '⚠️ QueryGuard INACTIVE (Vulnerable)'}
                </span>
              </label>
            </div>

            <div className="quick-actions">
              <span className="control-label">Quick Lab Actions</span>
              <button type="button" className="action-chip secondary" onClick={fillNormalUser}>
                👤 Load Valid Student (`student1`)
              </button>
              <button type="button" className="action-chip warning" onClick={fillPayload}>
                ⚡ Inject SQL Payload (`admin' OR '1'='1`)
              </button>
            </div>
          </div>
        </div>

        <footer className="sidebar-footer">
          <p>Cybersecurity Skill Lab • Project: QueryGuard</p>
        </footer>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="portal-main">
        {responseLog ? (
          /* FULL-WIDTH DASHBOARD VIEW */
          <div className="dashboard-wrapper">
            <div className="dash-header">
              <div className="welcome-banner">
                <span className="success-badge">Authentication Successful</span>
                <h2>Welcome back, {responseLog.user?.username}!</h2>
                <p>{responseLog.message}</p>
              </div>
              <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
            </div>

            <div className="dash-grid">
              <div className="dash-card profile-card">
                <h3>User Session Profile</h3>
                <div className="profile-details">
                  <div className="avatar-large">
                    {responseLog.user?.username ? responseLog.user.username[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="username-display">{responseLog.user?.username}</h4>
                    <span className="role-badge">{responseLog.user?.role}</span>
                    <p className="user-id-text">Record ID: #{responseLog.user?.id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="dash-card telemetry-card">
                <h3>Execution Telemetry & Traceability</h3>
                <div className="telemetry-item">
                  <span className="telemetry-key">Protection Mode:</span>
                  <span className="telemetry-val">{responseLog.mode || (queryGuardEnabled ? 'Secure (Parameterized)' : 'Vulnerable (Concatenation)')}</span>
                </div>
                {responseLog.executedQuery && (
                  <div className="query-box">
                    <span>Executed SQL Query:</span>
                    <code>{responseLog.executedQuery}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EXPANDED PROFESSIONAL LOGIN CONTAINER */
          <div className="login-box-container">
            <div className="login-box-header">
              <h2>Account Login</h2>
              <p>Enter your institutional credentials to proceed</p>
            </div>

            <form onSubmit={handleLogin} className="enterprise-form">
              {errorLog && (
                <div className="portal-alert error">
                  <strong>Authentication Refused</strong>
                  <p>{errorLog.message || errorLog.error || 'Access denied by database.'}</p>
                  {errorLog.executedQuery && (
                    <code className="alert-query">Query: {errorLog.executedQuery}</code>
                  )}
                </div>
              )}

              <div className="input-group">
                <label htmlFor="username">Username or Registration ID</label>
                <div className="field-wrapper">
                  <span className="field-icon">👤</span>
                  <input 
                    id="username"
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="e.g., student1 or admin"
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-flex">
                  <label htmlFor="password">Password</label>
                  <a href="#help" onClick={(e) => e.preventDefault()} className="help-link">Forgot password?</a>
                </div>
                <div className="field-wrapper">
                  <span className="field-icon">🔒</span>
                  <input 
                    id="password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••••••"
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn-signin" disabled={isLoading}>
                {isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}
              </button>
            </form>

            <div className="login-box-footer">
              <p>Protected by QueryGuard</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
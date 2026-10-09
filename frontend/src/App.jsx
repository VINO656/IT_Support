import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Chat from './components/Chat';
import Tickets from './components/Tickets';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>AI Support Nexus</h1>
        <nav style={{ marginLeft: '2rem', display: 'flex', gap: '1rem', flex: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Chat</Link>
          <Link to="/tickets" style={{ color: 'white', textDecoration: 'none' }}>My Tickets</Link>
          <Link to="/admin" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', marginLeft: 'auto' }}>IT Admin</Link>
        </nav>
        <div>
          <span style={{ marginRight: '1rem', color: 'var(--text-muted)' }}>
            Welcome, {user?.name}
          </span>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard">
        <Routes>
          <Route path="/" element={<Chat token={token} />} />
          <Route path="/tickets" element={<Tickets token={token} />} />
          <Route path="/admin" element={<AdminDashboard token={token} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

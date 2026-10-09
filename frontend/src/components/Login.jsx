import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { name, email, password } : { email, password };
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        {isRegister ? 'Create Account' : 'Welcome Back'}
      </h2>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="form-group">
            <label>Name</label>
            <input type="text" required className="form-control" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" required className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn" style={{ width: '100%' }}>
          {isRegister ? 'Sign Up' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        {isRegister ? 'Already have an account? ' : 'Need an account? '}
        <span 
          style={{ color: 'var(--primary)', cursor: 'pointer' }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Login' : 'Register'}
        </span>
      </div>
    </div>
  );
};

export default Login;

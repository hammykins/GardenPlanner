import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import { register, login } from '../../api/auth.api';

type AuthMode = 'login' | 'signup';

const LoginSignup: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === 'signup') {
        const res = await register(email);
        setMessage(res.message);
        setLoading(false);
        return;
      }
      // Login flow
      const res = await login(username, password);
      setMessage(res.message);
      if (res.token) {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('username', res.username);
        navigate('/'); // Redirect to home page
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || 'Error occurred');
    }
    setLoading(false);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setUsername('');
    setPassword('');
    setMessage('Logged out successfully.');
    navigate('/login');
  };

  return (
    <div className="login-signup-container">
      <div className="login-signup-card">
        <div className="side-panel">
          <div className="handwritten">Garden Yard Planner</div>
          <div style={{ fontSize: '1.1rem', color: '#4a6c4a', fontFamily: 'Caveat, Pacifico, cursive', marginTop: 8 }}>
            Welcome! Plan your garden, track your plants, and grow with us.
          </div>
        </div>
        <div className="main-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="handwritten" style={{ fontSize: '1.5rem', marginBottom: 8 }}>
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </div>
            {mode === 'login' ? (
              <>
                <input
                  className="input"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  minLength={3}
                  maxLength={20}
                />
                <input
                  className="input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  className="submit-btn"
                  style={{ background: '#b7c9a7', marginTop: 8 }}
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <input
                className="input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            )}
            <button
              className="submit-btn"
              style={{ background: '#b7c9a7' }}
              type="submit"
              disabled={loading}
            >
              {loading ? (mode === 'login' ? 'Logging in...' : 'Sending link...') : (mode === 'login' ? 'Login' : 'Send Registration Link')}
            </button>
            {message && <div className="message">{message}</div>}
          </form>
          <div className="switch-link">
            {mode === 'login' ? (
              <>
                New here?
                <button className="link-btn" type="button" onClick={() => { setMode('signup'); setMessage(null); }}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?
                <button className="link-btn" type="button" onClick={() => { setMode('login'); setMessage(null); }}>
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;

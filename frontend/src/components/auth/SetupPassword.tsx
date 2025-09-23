import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';

const SetupPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [valid, setValid] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function validateToken() {
      if (!token) return;
      try {
        const res = await apiClient.get(`/auth/setup-password`, { params: { token } });
        setEmail(res.data.email);
        setValid(true);
      } catch (err: any) {
        setMessage(err?.response?.data?.detail || 'Invalid or expired link');
        setValid(false);
      }
    }
    validateToken();
  }, [token]);

  // Username and password validation
  function validateUsername(name: string) {
    return /^[a-zA-Z0-9]{3,20}$/.test(name);
  }
  function validatePassword(pw: string) {
    // At least 8 chars, one letter, one number
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/.test(pw);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    if (!validateUsername(username)) {
      setMessage('Username must be 3-20 characters, letters/numbers/underscores only.');
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setMessage('Password must be at least 8 characters, include a letter and a number.');
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.post('/auth/setup-password', { token, username, password });
      setMessage(res.data.message);
      setValid(false);
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || 'Error setting password');
    }
    setLoading(false);
  };

  if (!token) {
    return <div className="setup-password-container">Missing token in link.</div>;
  }

  return (
    <div className="setup-password-container">
      <div className="setup-password-card">
        <div className="handwritten" style={{ fontSize: '1.5rem', marginBottom: 8 }}>
          Set Your Password
        </div>
        {valid ? (
          <form className="setup-password-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 8 }}>Account: <b>{email}</b></div>
            <input
              className="input"
              type="text"
              placeholder="Create username"
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
              placeholder="Create password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
            <button
              className="submit-btn"
              style={{ background: '#b7c9a7' }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Setting password...' : 'Set Password'}
            </button>
            {message && <div className="message">{message}</div>}
          </form>
        ) : (
          <div className="message">{message || 'Invalid or expired link.'}</div>
        )}
      </div>
    </div>
  );
};

export default SetupPassword;

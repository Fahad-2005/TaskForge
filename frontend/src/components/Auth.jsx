import { useState } from 'react';
import './Auth.css';

function Auth({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
    const payload = isLoginView ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-grid-overlay" />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">⚡</div>
          <h2 className="auth-title">TaskForge</h2>
          <p className="auth-subtitle">
            {isLoginView ? "Welcome back! Let's get to work." : 'Create your free workspace account.'}
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input id="auth-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input id="auth-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Get Started')}
          </button>
        </form>

        <p className="auth-toggle-text">
          {isLoginView ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setIsLoginView(!isLoginView); setErrorMessage(''); }} className="auth-link" role="button" tabIndex={0}>
            {isLoginView ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;

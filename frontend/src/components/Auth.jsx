import React, { useState } from 'react';
import './Auth.css';

function Auth({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Stores database validation errors

  // Add a loading state flag at the top of your component
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage(''); 
  setIsLoading(true); // Disable input actions during network processing

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
      // Pulls out custom error messages thrown by our backend router configurations
      throw new Error(data.message || 'Authentication failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    onLoginSuccess(); 

  } catch (error) {
    setErrorMessage(error.message); 
  } finally {
    setIsLoading(false); // Re-enable user access controls
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <div style={{ textAlign: 'center' }}>
          <h2 className="auth-title">⚡ TaskForge</h2>
          <p className="auth-subtitle">
            {isLoginView ? "Welcome back! Let's get to work." : 'Create your free workspace account.'}
          </p>
        </div>

        {/* Render error alerts directly from the server if they happen */}
        {errorMessage && (
          <div style={{ backgroundColor: '#ef4444', color: '#fff', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

         <button type="submit" className="auth-btn" disabled={isLoading}>
  {isLoading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Get Started')}
</button>
        </form>

        <p className="auth-toggle-text">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLoginView(!isLoginView); setErrorMessage(''); }} className="auth-link">
            {isLoginView ? 'Sign Up' : 'Log In'}
          </span>
        </p>

      </div>
    </div>
  );
}

export default Auth;
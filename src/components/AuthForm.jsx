import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

const AuthForm = ({ setCurrentUser }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        // REGISTER LOGIC
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setCurrentUser(userCredential.user);
      } else {
        // LOGIN LOGIC
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setCurrentUser(userCredential.user);
      }
    } catch (err) {
      setError(err.message.includes('auth/user-not-found') 
        ? 'Account not found. Please register.' 
        : 'Authentication failed. Check your credentials.');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <div className="auth-header">
          <h1>ORL <span className="red-text">RL</span></h1>
          <p>{isRegistering ? 'CREATE NEW PILOT PROFILE' : 'DATA TERMINAL ACCESS'}</p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="input-group">
            <label>EMAIL ADDRESS</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
              required 
            />
          </div>

          <div className="input-group">
            <label>SECURITY KEY</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="f1-btn-main">
            {isRegistering ? 'REGISTER ACCOUNT' : 'LOG IN'}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            className="toggle-auth-btn"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering 
              ? 'Already have a profile? Log In' 
              : 'New Driver? Register Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
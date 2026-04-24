import React, { useState, useEffect } from 'react';
import { Bot, Mail, Phone, ArrowLeft } from 'lucide-react';
import useAuthStore from '../hooks/useAuth';
import './Login.css';

export default function Login() {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithPhone,
    verifyPhoneOtp,
    signInAsGuest,
    setupRecaptcha,
    loading, 
    error 
  } = useAuthStore();

  const [mode, setMode] = useState('google'); // google, email, phone
  const [isSignUp, setIsSignUp] = useState(false);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Phone form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    // Setup invisible recaptcha when we switch to phone tab
    if (mode === 'phone') {
      setupRecaptcha('recaptcha-container');
    }
  }, [mode, setupRecaptcha]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      await signUpWithEmail(email, password, name);
    } else {
      await signInWithEmail(email, password);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmation = await signInWithPhone(phone);
      setConfirmationResult(confirmation);
    } catch(err) {
      // Error handled in store
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (confirmationResult) {
      await verifyPhoneOtp(confirmationResult, otp);
    }
  };

  const TopSelector = () => (
    <div className="login__selector">
      <button className={mode === 'google' ? 'active' : ''} onClick={() => setMode('google')}>Google</button>
      <button className={mode === 'email' ? 'active' : ''} onClick={() => setMode('email')}>Email</button>
      <button className={mode === 'phone' ? 'active' : ''} onClick={() => { setMode('phone'); setConfirmationResult(null); }}>Phone</button>
    </div>
  );

  return (
    <div className="login">
      <div className="login__bg-glow login__bg-glow--1" />
      <div className="login__bg-glow login__bg-glow--2" />

      <div className="login__card glass-panel">
        <div className="login__icon-wrapper">
          <Bot size={40} />
        </div>

        <h1 className="login__title">
          Lyfe<span className="login__title-accent">Core</span> Hub
        </h1>
        
        <TopSelector />

        {/* GOOGLE MODE */}
        {mode === 'google' && (
          <div className="login__content fade-in">
            <p className="login__subtitle">
              Your AI-powered life optimization engine.
              <br />
              (Recommended for Calendar/Tasks sync)
            </p>
            <button
              className="login__google-btn login__primary-btn"
              onClick={signInWithGoogle}
              disabled={loading}
              id="btn-google-signin"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{loading ? 'Connecting…' : 'Continue with Google'}</span>
            </button>

            <div className="login__divider">
              <span>or</span>
            </div>

            <button
              className="login__guest-btn"
              onClick={signInAsGuest}
              disabled={loading}
              id="btn-guest-signin"
            >
              Continue as Guest (Demo Mode)
            </button>
          </div>
        )}

        {/* EMAIL MODE */}
        {mode === 'email' && (
          <form className="login__content fade-in" onSubmit={handleEmailSubmit}>
            <p className="login__subtitle">Enter your email and password to continue.</p>
            {isSignUp && (
              <input 
                type="text" 
                placeholder="Full Name" 
                className="login__input"
                value={name} onChange={e => setName(e.target.value)}
                required={isSignUp}
              />
            )}
            <input 
              type="email" 
              placeholder="Email address" 
              className="login__input"
              value={email} onChange={e => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="login__input"
              value={password} onChange={e => setPassword(e.target.value)}
              required
            />
            <button className="login__primary-btn" type="submit" disabled={loading}>
              <Mail size={18} /> {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
            <p className="login__switch">
              {isSignUp ? 'Already have an account?' : 'Need an account?'} 
              <span onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? ' Sign In' : ' Sign Up'}</span>
            </p>
          </form>
        )}

        {/* PHONE MODE */}
        {mode === 'phone' && (
          <div className="login__content fade-in">
            <p className="login__subtitle">We will send you a verification code via SMS.</p>
            
            {!confirmationResult ? (
              <form onSubmit={handlePhoneSubmit} style={{ width: '100%' }}>
                 <input 
                  type="tel" 
                  placeholder="+1 555 123 4567" 
                  className="login__input"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  required
                />
                <button className="login__primary-btn" type="submit" disabled={loading}>
                  <Phone size={18} /> {loading ? 'Sending...' : 'Send SMS Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} style={{ width: '100%' }}>
                <p className="login__subtitle" style={{color: 'var(--accent)'}}>Code sent to {phone}</p>
                 <input 
                  type="text" 
                  placeholder="123456" 
                  className="login__input login__input--center"
                  value={otp} onChange={e => setOtp(e.target.value)}
                  required
                  maxLength={6}
                />
                <button className="login__primary-btn" type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button type="button" className="login__back-btn" onClick={() => setConfirmationResult(null)}>
                  <ArrowLeft size={14} /> Back
                </button>
              </form>
            )}
            <div id="recaptcha-container"></div>
          </div>
        )}

        {error && (
          <div className="login__error">{error}</div>
        )}

        <p className="login__footer">
          Your data is encrypted and never shared. <br />
          Multi-tenant isolated by design.
        </p>
      </div>
    </div>
  );
}

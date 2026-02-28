import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { Lock, Mail, UserPlus, LogIn } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', ''));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          <span style={{ marginLeft: '10px' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </span>
        </h2>
        
        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.icon} />
            <input 
              type="email" 
              placeholder="Email Address" 
              style={styles.input}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input 
              type="password" 
              placeholder="Password" 
              style={styles.input}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span 
            style={styles.toggleLink} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? ' Sign Up' : ' Log In'}
          </span>
        </p>
      </div>
    </div>
  );
};

// Simple Industry-Standard CSS-in-JS
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' },
  title: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', padding: '10px' },
  icon: { color: '#888', marginRight: '10px' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '14px' },
  button: { padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: 'red', fontSize: '12px', marginTop: '5px' },
  toggleText: { marginTop: '20px', fontSize: '14px', color: '#666' },
  toggleLink: { color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }
};

export default Auth;
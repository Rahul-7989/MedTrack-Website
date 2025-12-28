
import React, { useState } from 'react';
import { Logo } from '../constants';
import { View, User } from '../types';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface SignInProps {
  onNavigate: (view: View) => void;
  onAuthSuccess: (user: User) => void;
}

const SignIn: React.FC<SignInProps> = ({ onNavigate, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter both email and password');
    
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      
      onAuthSuccess({
        name: fbUser.displayName || 'Friend',
        email: fbUser.email || email
      });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-softIvory">
      <div className="w-full max-w-md bg-paleSage/50 rounded-[2.5rem] p-12 soft-shadow flex flex-col items-center border-2 border-paleSage">
        <div className="text-mutedTeal mb-8">
          <Logo className="w-16 h-16" />
        </div>
        
        <h1 className="text-3xl font-black text-charcoal mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-mutedSlate text-center mb-10 font-black">
          Sign in to your family hub
        </p>

        {error && (
          <div className="w-full p-4 mb-8 bg-warmAmber/10 text-warmAmber text-sm font-black rounded-2xl border border-warmAmber/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="w-full space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-softAsh ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-14 bg-white border-2 border-paleSage rounded-2xl px-5 flex items-center text-charcoal font-black focus:outline-none focus:ring-4 focus:ring-mutedTeal/10 transition-all placeholder:text-softAsh/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-softAsh ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-14 bg-white border-2 border-paleSage rounded-2xl px-5 flex items-center text-charcoal font-black focus:outline-none focus:ring-4 focus:ring-mutedTeal/10 transition-all placeholder:text-softAsh/40"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-softMint text-charcoal font-black rounded-2xl border-2 border-mutedTeal/20 shadow-md hover:bg-mutedTeal/10 transition-all disabled:opacity-50 mt-4 text-lg"
          >
            {loading ? 'Entering Hub...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-mutedSlate mt-10 font-black">
          New to MedTrack?{' '}
          <button 
            onClick={() => onNavigate('signup')}
            className="text-mutedTeal font-black hover:underline underline-offset-4"
          >
            Create your account
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

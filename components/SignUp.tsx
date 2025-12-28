
import React, { useState } from 'react';
import { Logo } from '../constants';
import { View, User } from '../types';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface SignUpProps {
  onNavigate: (view: View) => void;
  onAuthSuccess: (user: User) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onNavigate, onAuthSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('All fields are required');
    
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName: name });
      
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
        familyHubId: null
      });
      
      onAuthSuccess({
        name: name,
        email: email
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-softIvory">
      <div className="w-full max-w-md bg-paleSage/50 rounded-[2.5rem] p-12 shadow-xl flex flex-col items-center border-2 border-paleSage">
        <div className="text-mutedTeal mb-8">
          <Logo className="w-16 h-16" />
        </div>
        
        <h1 className="text-3xl font-black text-charcoal mb-2 text-center">
          Join MedTrack
        </h1>
        <p className="text-mutedSlate text-center mb-10 font-black">
          Start caring for your family today
        </p>

        {error && (
          <div className="w-full p-4 mb-8 bg-warmAmber/10 text-warmAmber text-sm font-black rounded-2xl border border-warmAmber/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="w-full space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-softAsh ml-1">Full Name</label>
            <input 
              type="text" 
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-14 bg-white border-2 border-paleSage rounded-2xl px-5 flex items-center text-charcoal font-black focus:outline-none focus:ring-4 focus:ring-mutedTeal/10 transition-all placeholder:text-softAsh/40"
            />
          </div>
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
            {loading ? 'Creating Hub...' : 'Get Started'}
          </button>
        </form>

        <p className="text-sm text-mutedSlate mt-10 font-black">
          Already have an account?{' '}
          <button 
            onClick={() => onNavigate('signin')}
            className="text-mutedTeal font-black hover:underline underline-offset-4"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;


import React, { useState, useEffect } from 'react';
import { Logo } from '../constants';
import { View } from '../types';
import { db, auth } from '../firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { Copy, Check } from 'lucide-react';

interface CreateHubProps {
  onNavigate: (view: View) => void;
}

const CreateHub: React.FC<CreateHubProps> = ({ onNavigate }) => {
  const [hubName, setHubName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    setJoinCode(generateCode());
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCreateHub = async () => {
    if (!hubName.trim()) {
      setError('Family Hub Name is required.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required. Please sign in again.");

      const hubRef = await addDoc(collection(db, "hubs"), {
        hubName: hubName,
        joinCode: joinCode,
        members: [user.uid],
        admin: user.uid,
        createdAt: new Date()
      });

      await setDoc(doc(db, "users", user.uid), {
        familyHubId: hubRef.id
      }, { merge: true });

      onNavigate('dashboard'); 
    } catch (err: any) {
      setError(err.message || 'Something went wrong while creating the hub.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-softIvory flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border-2 border-paleSage">
        <div className="text-center mb-12">
          <div className="text-mutedTeal flex justify-center mb-8">
            <Logo className="w-20 h-20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-charcoal mb-4">
            Your Family Hub
          </h1>
          <p className="text-xl text-mutedSlate font-black">
            Name your hub and invite others to care with you.
          </p>
        </div>

        {error && (
          <div className="w-full p-5 mb-10 bg-warmAmber/10 text-warmAmber text-sm font-black rounded-2xl border border-warmAmber/20">
            {error}
          </div>
        )}

        <div className="space-y-12">
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-[0.3em] text-softAsh ml-1">
              Hub Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Home Care Group"
              value={hubName}
              onChange={(e) => setHubName(e.target.value)}
              className="w-full h-16 bg-lightSand border-2 border-paleSage rounded-2xl px-8 text-xl text-charcoal font-black focus:outline-none focus:border-mutedTeal/30 transition-all placeholder:text-softAsh/40"
              required
            />
          </div>

          <div className="space-y-6">
            <label className="block text-xs font-black uppercase tracking-[0.3em] text-softAsh ml-1">
              Invite Code
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={joinCode}
                  readOnly
                  className="w-full h-16 bg-softMint/30 border-2 border-dashed border-mutedTeal/20 rounded-2xl px-6 text-4xl font-mono font-black tracking-[0.2em] text-mutedTeal text-center focus:outline-none uppercase"
                />
              </div>
              <button 
                onClick={handleCopy}
                type="button"
                className={`h-16 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-lg border-2 ${
                  copied 
                    ? 'bg-softMint border-mutedTeal/30 text-mutedTeal shadow-inner' 
                    : 'bg-paleSage/30 border-paleSage text-softAsh hover:bg-paleSage/50'
                }`}
              >
                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="pt-10 flex flex-col gap-6">
            <button 
              onClick={handleCreateHub}
              disabled={loading || !hubName.trim()}
              className="w-full py-6 bg-softMint text-charcoal border-2 border-mutedTeal/20 font-black text-2xl rounded-2xl shadow-lg hover:bg-mutedTeal/10 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              {loading ? "Creating..." : "Create Family Hub"}
            </button>
            <button 
              onClick={() => onNavigate('hub-choice')}
              className="py-2 text-mutedSlate font-black hover:text-charcoal transition-colors text-base underline underline-offset-8 decoration-softAsh/30"
            >
              Cancel and go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHub;

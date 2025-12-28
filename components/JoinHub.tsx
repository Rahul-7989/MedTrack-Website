import React, { useState } from 'react';
import { Logo } from '../constants';
import { View } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, setDoc } from 'firebase/firestore';
import { ChevronLeft, Link as LinkIcon } from 'lucide-react';

interface JoinHubProps {
  onNavigate: (view: View) => void;
}

const JoinHub: React.FC<JoinHubProps> = ({ onNavigate }) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinHub = async () => {
    if (!joinCode.trim()) return setError('Please enter a 6-digit code');
    
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const q = query(collection(db, "hubs"), where("joinCode", "==", joinCode.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Invalid Code! Please check and try again.");
      }

      const hubDoc = querySnapshot.docs[0];
      const hubId = hubDoc.id;

      await updateDoc(doc(db, "hubs", hubId), {
        members: arrayUnion(user.uid)
      });

      await setDoc(doc(db, "users", user.uid), {
        familyHubId: hubId
      }, { merge: true });

      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Failed to join hub.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-softIvory flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-paleSage rounded-[3rem] p-12 soft-shadow border border-softAsh/5 flex flex-col items-center">
        <div className="p-6 rounded-[2rem] bg-warmAmber/10 text-warmAmber mb-10">
          <LinkIcon className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl font-bold text-charcoal mb-4 text-center">
          Join Family Hub
        </h1>
        <p className="text-mutedSlate text-center mb-12 text-lg">
          Enter the 6-digit code shared with you.
        </p>

        {error && (
          <div className="w-full p-4 mb-8 bg-warmAmber/10 text-warmAmber text-sm font-bold rounded-2xl border border-warmAmber/20">
            {error}
          </div>
        )}

        <div className="w-full space-y-8 mb-10">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.3em] text-softAsh ml-1">Enter Code</label>
            <input 
              type="text" 
              placeholder="000000"
              value={joinCode}
              maxLength={6}
              onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full h-18 bg-softIvory/50 border border-softAsh/10 rounded-2xl px-6 text-4xl font-mono font-black tracking-[0.6em] text-center text-charcoal focus:outline-none focus:ring-4 focus:ring-warmAmber/10"
            />
          </div>
          <button 
            onClick={handleJoinHub}
            disabled={loading || joinCode.length !== 6}
            className="w-full py-5 bg-warmAmber text-softIvory font-bold rounded-2xl soft-shadow hover:opacity-95 transition-all disabled:opacity-40 text-xl"
          >
            {loading ? "Joining..." : "Enter Hub"}
          </button>
        </div>

        <button 
          onClick={() => onNavigate('hub-choice')}
          className="flex items-center gap-2 text-mutedSlate hover:text-charcoal transition-colors font-bold text-base underline underline-offset-8 decoration-softAsh/30"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to choices
        </button>
      </div>
    </div>
  );
};

export default JoinHub;
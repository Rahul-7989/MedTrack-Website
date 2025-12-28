
import React from 'react';
import { Home, Link as LinkIcon } from 'lucide-react';
import { View, User } from '../types';

interface FamilyHubChoiceProps {
  onNavigate: (view: View) => void;
  user: User | null;
}

const FamilyHubChoice: React.FC<FamilyHubChoiceProps> = ({ onNavigate, user }) => {
  return (
    <div className="min-h-[85vh] px-6 py-24 bg-softIvory flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-20 space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-charcoal">
            Welcome, <span className="text-mutedTeal">{user?.name || 'Friend'}</span>.
          </h1>
          <p className="text-xl text-mutedSlate max-w-2xl mx-auto leading-relaxed font-black">
            Choose how you'd like to use MedTrack. You can invite your entire family later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Create Hub */}
          <div 
            onClick={() => onNavigate('create-hub')}
            className="group bg-white rounded-[3rem] p-12 shadow-md hover:-translate-y-2 transition-all cursor-pointer border-2 border-paleSage hover:border-mutedTeal/20"
          >
            <div className="p-6 rounded-[2rem] bg-mutedTeal/10 text-mutedTeal w-fit mb-10 group-hover:scale-105 transition-transform">
              <Home className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-charcoal mb-6">
              Create a New Hub
            </h2>
            <p className="text-mutedSlate leading-relaxed mb-12 text-lg font-black">
              Start a fresh family space. You'll be the primary caregiver and can invite others with a simple code.
            </p>
            <button 
              className="w-full py-5 bg-softMint text-charcoal font-black rounded-2xl border-2 border-mutedTeal/10 shadow-sm hover:bg-mutedTeal/10 transition-all text-lg"
            >
              Start New Hub
            </button>
          </div>

          {/* Join Hub */}
          <div 
            onClick={() => onNavigate('join-hub')}
            className="group bg-white rounded-[3rem] p-12 shadow-md hover:-translate-y-2 transition-all cursor-pointer border-2 border-paleSage hover:border-warmAmber/20"
          >
            <div className="p-6 rounded-[2rem] bg-warmAmber/10 text-warmAmber w-fit mb-10 group-hover:scale-105 transition-transform">
              <LinkIcon className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-charcoal mb-6">
              Join Existing Hub
            </h2>
            <p className="text-mutedSlate leading-relaxed mb-12 text-lg font-black">
              Received a 6-digit code? Enter it to join your family's shared space and start helping.
            </p>
            <button 
              className="w-full py-5 bg-warmAmber/20 text-charcoal font-black rounded-2xl border-2 border-warmAmber/20 shadow-sm hover:bg-warmAmber/30 transition-all text-lg"
            >
              Enter Hub Code
            </button>
          </div>
        </div>

        <div className="mt-20 text-center">
          <button 
            onClick={() => onNavigate('home')}
            className="text-mutedSlate font-black hover:text-charcoal transition-colors underline underline-offset-8 decoration-softAsh/30"
          >
            ← Back to introduction
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyHubChoice;

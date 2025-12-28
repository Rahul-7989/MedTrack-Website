
import React from 'react';
import { Logo, BRAND_NAME } from '../constants';
import { View, User } from '../types';
import { LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: View) => void;
  currentView: View;
  user: User | null;
  hubName: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, user, hubName, onLogout }) => {
  const isDashboard = currentView === 'dashboard';

  return (
    <header className="sticky top-0 z-50 w-full bg-softIvory/90 backdrop-blur-md border-b border-softAsh/10 py-4 px-6 md:px-12 flex items-center justify-between transition-all">
      <div className="flex items-center gap-6">
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="text-mutedTeal transition-transform group-hover:scale-105">
            <Logo className="w-10 h-10" />
          </div>
          <span className="text-2xl font-black tracking-tight text-charcoal">
            {BRAND_NAME}
          </span>
        </div>

        {isDashboard && hubName && (
          <div className="hidden md:flex items-center gap-2 pl-6 border-l border-softAsh/20">
            <span className="px-4 py-1.5 bg-softMint text-mutedTeal text-xs font-black rounded-full uppercase tracking-widest border border-mutedTeal/10">
              {hubName}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4 pl-4 border-l border-softAsh/20 group relative">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-charcoal leading-none mb-1">{user.name}</p>
              <p className="text-[10px] text-mutedSlate leading-none uppercase tracking-wider font-black opacity-80">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-softMint border border-mutedTeal/20 flex items-center justify-center text-mutedTeal overflow-hidden shadow-inner">
               <UserIcon className="w-5 h-5" />
            </div>
            
            <button 
              onClick={onLogout}
              className="p-2 text-mutedSlate hover:text-warmAmber transition-colors hover:bg-warmAmber/5 rounded-full"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('signin')}
              className={`px-5 py-2 text-sm font-black transition-colors rounded-full ${
                currentView === 'signin' 
                  ? 'text-mutedTeal' 
                  : 'text-mutedSlate hover:text-charcoal'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="px-6 py-2.5 text-sm font-black bg-softMint text-charcoal border-2 border-mutedTeal/10 hover:bg-mutedTeal/10 transition-all rounded-xl shadow-sm"
            >
              Join Hub
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


import React from 'react';
import { Logo, BRAND_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="px-6 py-20 bg-softIvory border-t border-softAsh/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1 md:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 text-mutedTeal" />
            <span className="text-2xl font-bold text-charcoal">{BRAND_NAME}</span>
          </div>
          <p className="text-mutedSlate max-w-md leading-relaxed text-lg font-medium">
            MedTrack is a place for families to look after one another. 
            We believe health tracking should be supportive, transparent, and beautifully simple.
          </p>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest text-charcoal">Our Promise</h4>
          <p className="text-mutedSlate text-sm leading-relaxed font-medium">
            Your data stays within your family hub. We never sell your health information or use it for ads. 
            Trust is the foundation of care.
          </p>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest text-charcoal">Connect</h4>
          <div className="space-y-4 text-sm text-mutedSlate font-medium">
            <p>Need help or have ideas? We're listening:</p>
            <a href="mailto:care@medtrac.app" className="text-mutedTeal hover:underline font-black text-base">
              care@medtrac.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

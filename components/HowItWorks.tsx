
import React from 'react';
import { Users, ClipboardList, BellRing, Activity } from 'lucide-react';
import { FeatureCardProps } from '../types';

const FeatureCard: React.FC<FeatureCardProps & { color: string }> = ({ icon, title, description, step, color }) => (
  <div className="group relative flex flex-col p-10 rounded-[3rem] bg-white hover:bg-white/50 transition-all duration-500 border border-softAsh/5 hover:border-mutedTeal/10 hover:shadow-2xl">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-bl-[10rem] transition-opacity duration-500`} />
    
    <div className="flex items-center justify-between mb-10 relative z-10">
      <div className={`p-5 rounded-3xl bg-lightSand group-hover:bg-white text-mutedTeal shadow-inner transition-colors`}>
        {icon}
      </div>
      <span className="text-6xl font-black text-softAsh/10 italic select-none">
        {step}
      </span>
    </div>
    <h3 className="text-2xl font-extrabold mb-5 text-charcoal">{title}</h3>
    <p className="text-mutedSlate leading-relaxed text-lg font-light">
      {description}
    </p>
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <section className="px-6 py-32 bg-paleSage/30">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl space-y-6 mb-24">
          <div className="inline-flex items-center gap-2 text-mutedTeal font-bold tracking-widest uppercase text-xs">
            <Activity className="w-4 h-4" />
            Simple Features
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-charcoal leading-tight">Everything you need, <br /><span className="text-mutedTeal">nothing you don't.</span></h2>
          <p className="text-xl text-mutedSlate leading-relaxed font-light">
            We focus on the essentials of family care coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            step="01"
            color="from-softMint to-mutedTeal"
            icon={<Users className="w-8 h-8" />}
            title="Shared Family Hub"
            description="Invite family members to one shared dashboard. Everyone stays informed on the daily schedule."
          />
          <FeatureCard 
            step="02"
            color="from-warmAmber to-orange-400"
            icon={<ClipboardList className="w-8 h-8" />}
            title="Easy Scheduling"
            description="Set reminders for any medication. Add visual guides and simple instructions for clarity."
          />
          <FeatureCard 
            step="03"
            color="from-sky-400 to-blue-600"
            icon={<BellRing className="w-8 h-8" />}
            title="Connected Alerts"
            description="Get notified if a loved one misses a dose. A simple safety net for your entire family."
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


import React from 'react';
import { CheckCircle2, Pill, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative px-6 pt-16 pb-24 md:pt-32 md:pb-40 max-w-7xl mx-auto">
      {/* Background blobs for depth */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-softMint/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 -left-20 w-72 h-72 bg-warmAmber/5 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <div className="flex-1 space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-mutedTeal/10 text-mutedTeal rounded-full text-xs font-extrabold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" />
            Simple Family Health Tracking
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] text-charcoal tracking-tight">
            Stay in sync, <br />
            <span className="text-mutedTeal">stay healthy.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-mutedSlate max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
            A private space for your family to coordinate medications. 
            Real-time updates and simple reminders for the people you care about.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
            <button 
              onClick={onGetStarted}
              className="px-10 py-5 bg-mutedTeal text-softIvory font-bold rounded-2xl soft-shadow hover:-translate-y-1 transition-all text-xl"
            >
              Start Your Family Hub
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          <div className="relative z-10 p-4 md:p-8">
            <div className="grid grid-cols-6 grid-rows-6 gap-4 h-[450px] md:h-[550px]">
              {/* Main App Mockup Card */}
              <div className="col-span-4 row-span-4 bg-white rounded-[3rem] shadow-2xl p-8 flex flex-col gap-6 relative overflow-hidden border border-softAsh/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-2xl bg-mutedTeal/10 flex items-center justify-center text-mutedTeal">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div className="h-6 w-24 bg-lightSand rounded-full" />
                </div>
                <div className="space-y-4">
                  <div className="h-10 w-full bg-lightSand/50 rounded-2xl" />
                  <div className="h-10 w-3/4 bg-lightSand/50 rounded-2xl" />
                </div>
                <div className="mt-auto p-6 bg-mutedTeal rounded-[2rem] text-white flex items-center justify-between">
                  <span className="font-bold">8:00 AM Dose</span>
                  <CheckCircle2 className="w-6 h-6 text-softMint" />
                </div>
              </div>
              
              {/* Floating Element 1 */}
              <div className="col-span-3 col-start-4 row-span-3 row-start-3 bg-softMint/10 backdrop-blur-md rounded-[2.5rem] shadow-xl p-6 border border-white/50 animate-in fade-in slide-in-from-right-8 delay-200 duration-700">
                <div className="space-y-4">
                  <div className="h-2 w-16 bg-mutedTeal/20 rounded-full" />
                  <div className="h-8 w-full bg-white rounded-xl" />
                  <div className="h-8 w-full bg-white rounded-xl" />
                </div>
              </div>

              {/* Floating Pill Icon */}
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-softMint rounded-3xl shadow-lg flex items-center justify-center text-mutedTeal animate-float hidden md:flex">
                 <Pill className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

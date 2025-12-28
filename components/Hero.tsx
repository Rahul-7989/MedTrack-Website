
import React from 'react';
import { CheckCircle2, Pill, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative px-6 pt-16 pb-24 md:pt-32 md:pb-40 max-w-7xl mx-auto">
      {/* Background blobs */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-softMint/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 -left-20 w-72 h-72 bg-warmAmber/10 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <div className="flex-1 space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-mutedTeal text-white rounded-full text-xs font-black tracking-widest uppercase shadow-md">
            <ShieldCheck className="w-5 h-5" />
            Reliable Family Care
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] text-charcoal tracking-tight">
            Stay in sync, <br />
            <span className="text-mutedTeal">stay healthy.</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-charcoal max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            A secure space for your family to coordinate medications. 
            Real-time updates for the people you love.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
            <button 
              onClick={onGetStarted}
              className="px-12 py-6 bg-mutedTeal text-white font-black rounded-3xl shadow-2xl hover:brightness-95 active:scale-95 transition-all text-2xl"
            >
              Start Family Hub
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          <div className="relative z-10 p-4 md:p-8">
            <div className="grid grid-cols-6 grid-rows-6 gap-6 h-[450px] md:h-[600px]">
              {/* Card Visualization */}
              <div className="col-span-4 row-span-4 bg-white rounded-[4rem] shadow-2xl p-10 flex flex-col gap-8 relative overflow-hidden border-2 border-paleSage animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-center">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-mutedTeal/10 flex items-center justify-center text-mutedTeal">
                    <Pill className="w-8 h-8" />
                  </div>
                  <div className="h-8 w-32 bg-paleSage rounded-full" />
                </div>
                <div className="space-y-6">
                  <div className="h-14 w-full bg-lightSand rounded-3xl border border-paleSage" />
                  <div className="h-14 w-3/4 bg-lightSand rounded-3xl border border-paleSage" />
                </div>
                <div className="mt-auto p-8 bg-charcoal rounded-[3rem] text-white flex items-center justify-between shadow-xl">
                  <span className="font-black text-xl">Dose Taken</span>
                  <CheckCircle2 className="w-10 h-10 text-softMint" />
                </div>
              </div>
              
              <div className="col-span-3 col-start-4 row-span-3 row-start-3 bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 border-2 border-paleSage animate-in fade-in slide-in-from-right-8 delay-200 duration-700">
                <div className="space-y-6">
                  <div className="h-4 w-24 bg-mutedTeal/30 rounded-full" />
                  <div className="h-10 w-full bg-paleSage rounded-2xl" />
                  <div className="h-10 w-full bg-paleSage rounded-2xl" />
                </div>
              </div>

              <div className="absolute -top-10 -left-10 w-24 h-24 bg-softMint rounded-[2rem] shadow-2xl flex items-center justify-center text-mutedTeal animate-float hidden md:flex border-4 border-white">
                 <Pill className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

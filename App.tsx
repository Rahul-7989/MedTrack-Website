
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import FamilyHubChoice from './components/FamilyHubChoice';
import CreateHub from './components/CreateHub';
import JoinHub from './components/JoinHub';
import Dashboard from './components/Dashboard';
import { View, User } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<User | null>(null);
  const [hasHub, setHasHub] = useState(false);
  const [activeHubName, setActiveHubName] = useState<string | null>(null);
  const [activeHubId, setActiveHubId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || 'Friend',
          email: currentUser.email || ''
        });
      } else {
        setUser(null);
        setHasHub(false);
        setActiveHubId(null);
        setActiveHubName(null);
        setIsLoading(false);
        setView('home');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Hub Listener (Reactive to User Doc changes)
  useEffect(() => {
    if (!user || !auth.currentUser) return;
    
    setIsLoading(true);
    const unsubscribeUser = onSnapshot(doc(db, "users", auth.currentUser.uid), async (userSnap) => {
      if (userSnap.exists() && userSnap.data().familyHubId) {
        const hubId = userSnap.data().familyHubId;
        const hubSnap = await getDoc(doc(db, "hubs", hubId));
        if (hubSnap.exists()) {
          setActiveHubName(hubSnap.data().hubName);
          setActiveHubId(hubId);
          setHasHub(true);
          // If the user just joined/created, ensure we switch to dashboard view
          if (['create-hub', 'join-hub', 'hub-choice'].includes(view)) {
            setView('dashboard');
          }
        } else {
          setHasHub(false);
        }
      } else {
        setHasHub(false);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("User doc listener error:", error);
      setIsLoading(false);
    });

    return () => unsubscribeUser();
  }, [user, view]);

  const handleNavigate = (newView: View) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const onAuthSuccess = (userData: User) => {
    setUser(userData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-softIvory">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mutedTeal"></div>
          <p className="font-black text-mutedSlate animate-pulse">MedTrack is waking up...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!user) {
      if (view === 'signin') return <SignIn onNavigate={handleNavigate} onAuthSuccess={onAuthSuccess} />;
      if (view === 'signup') return <SignUp onNavigate={handleNavigate} onAuthSuccess={onAuthSuccess} />;
      return (
        <>
          <Hero onGetStarted={() => handleNavigate('signup')} />
          <HowItWorks />
          <section className="px-6 py-24 text-center bg-lightSand">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-black text-charcoal">Ready to take the stress out of health?</h2>
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={() => handleNavigate('signup')} 
                  className="px-12 py-5 bg-softMint text-charcoal font-black rounded-2xl border-2 border-mutedTeal/20 shadow-lg hover:bg-mutedTeal/10 transition-all text-xl"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => handleNavigate('signin')} 
                  className="text-mutedSlate font-black hover:text-charcoal transition-colors border-b-2 border-softAsh/30 pb-1"
                >
                  Already part of a family hub? Sign in
                </button>
              </div>
            </div>
          </section>
        </>
      );
    }

    if (user && !hasHub) {
      if (view === 'create-hub') return <CreateHub onNavigate={handleNavigate} />;
      if (view === 'join-hub') return <JoinHub onNavigate={handleNavigate} />;
      return <FamilyHubChoice user={user} onNavigate={handleNavigate} />;
    }

    return <Dashboard user={user} hubName={activeHubName} hubId={activeHubId} />;
  };

  return (
    <div className="min-h-screen bg-softIvory text-charcoal">
      <Header 
        onNavigate={handleNavigate} 
        currentView={view} 
        user={user}
        hubName={activeHubName}
        onLogout={handleLogout}
      />
      
      <main>
        {renderContent()}
      </main>

      {(!user || !hasHub) && <Footer />}

      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-[10%] left-[5%] rotate-12 text-mutedTeal">
          <svg width="100" height="100" viewBox="0 0 40 40" fill="currentColor"><circle cx="20" cy="20" r="15"/></svg>
        </div>
        <div className="absolute bottom-[15%] right-[10%] -rotate-45 text-warmAmber">
          <svg width="150" height="150" viewBox="0 0 40 40" fill="currentColor"><rect x="10" y="10" width="20" height="20" rx="4"/></svg>
        </div>
      </div>
    </div>
  );
};

export default App;

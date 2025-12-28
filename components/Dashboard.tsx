
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  Pill, 
  Copy, 
  Check, 
  Image as ImageIcon,
  Pencil,
  Trash2,
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { User, Medication } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

interface DashboardProps {
  user: User | null;
  hubName: string | null;
  hubId: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, hubName, hubId }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [hubCode, setHubCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [medToDelete, setMedToDelete] = useState<Medication | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('');
  const [medImage, setMedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notifiedMeds = useRef(new Set<string>());

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const fetchHubData = async () => {
      if (!hubId) return;
      try {
        const hubSnap = await getDoc(doc(db, "hubs", hubId));
        if (hubSnap.exists()) {
          setHubCode(hubSnap.data().joinCode || '');
        }
      } catch (err) {
        console.error("Error fetching hub code:", err);
      }
    };
    fetchHubData();
  }, [hubId]);

  useEffect(() => {
    if (!hubId) return;

    const q = query(
      collection(db, "medications"), 
      where("hubId", "==", hubId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date().toISOString().split('T')[0];
      const meds = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let displayStatus = data.status as Medication['status'];
        if (data.lastTakenDate && data.lastTakenDate !== today && displayStatus === 'taken') {
          displayStatus = 'pending';
        }

        return {
          id: docSnap.id,
          name: data.name,
          dosage: data.dosage,
          reminderTime: data.reminderTime,
          status: displayStatus,
          hubId: data.hubId,
          lastTakenDate: data.lastTakenDate || '',
          imageUrl: data.imageUrl || null
        } as Medication;
      });
      
      meds.sort((a, b) => a.reminderTime.localeCompare(b.reminderTime));
      setMedications(meds);
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to medications:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [hubId]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 60000);
    return () => clearInterval(interval);
  }, [medications]);

  const checkReminders = () => {
    const now = new Date();
    const currentH = String(now.getHours()).padStart(2, '0');
    const currentM = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentH}:${currentM}`;

    medications.forEach(async (med) => {
      if (med.status === 'taken') return;
      
      const notificationKey = `${med.id}-${currentTimeStr}`;
      if (med.reminderTime === currentTimeStr && med.status === 'pending' && !notifiedMeds.current.has(notificationKey)) {
        sendBrowserNotification(`Time for ${med.name}`, `Please take your ${med.dosage} now.`);
        notifiedMeds.current.add(notificationKey);
      }

      const [medH, medM] = med.reminderTime.split(':').map(Number);
      const medTotalMinutes = medH * 60 + medM;
      const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

      if (nowTotalMinutes > medTotalMinutes + 30 && med.status === 'pending') {
        try {
          await updateDoc(doc(db, "medications", med.id), { status: 'missed' });
        } catch (err) { console.error(err); }
      }
    });
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCopyCode = () => {
    if (!hubCode) return;
    navigator.clipboard.writeText(hubCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 750000) return alert("File too large. Max 750KB.");
      const reader = new FileReader();
      reader.onloadend = () => setMedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerDeleteConfirm = (e: React.MouseEvent, med: Medication) => {
    e.stopPropagation();
    setMedToDelete(med);
    setShowDeleteModal(true);
  };

  const confirmDeleteMedication = async () => {
    if (!medToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "medications", medToDelete.id));
      setShowDeleteModal(false);
      showToast("Medication removed.");
    } catch (err) { alert("Failed to delete."); } finally { setIsSubmitting(false); }
  };

  const openAddModal = () => {
    setEditId(null); setMedName(''); setMedDosage(''); setMedTime(''); setMedImage(null);
    setShowModal(true);
  };

  const openEditModal = (e: React.MouseEvent, med: Medication) => {
    e.stopPropagation();
    setEditId(med.id); setMedName(med.name); setMedDosage(med.dosage); setMedTime(med.reminderTime); setMedImage(med.imageUrl || null);
    setShowModal(true);
  };

  const handleTakeMedicine = async (medId: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await updateDoc(doc(db, "medications", medId), { status: 'taken', lastTakenDate: today });
      showToast("Marked as taken.");
    } catch (err) { alert("Failed to update."); }
  };

  const handleUntakeMedicine = async (medId: string) => {
    try {
      await updateDoc(doc(db, "medications", medId), { status: 'pending', lastTakenDate: '' });
      showToast("Reset to pending.");
    } catch (err) { alert("Failed to update."); }
  };

  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medTime || !hubId) return;

    setIsSubmitting(true);
    try {
      const medData = { name: medName, dosage: medDosage || 'As directed', reminderTime: medTime, imageUrl: medImage || null };
      if (editId) {
        await updateDoc(doc(db, "medications", editId), medData);
        showToast("Medication updated.");
      } else {
        await addDoc(collection(db, "medications"), { ...medData, status: 'pending', hubId: hubId, lastTakenDate: '', createdAt: new Date() });
        showToast("Added to hub.");
      }
      setShowModal(false);
    } catch (error: any) {
      alert("Error saving: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const upcomingMeds = medications.filter(m => m.status !== 'taken');
  const takenMeds = medications.filter(m => m.status === 'taken');
  const hasMissedDoses = upcomingMeds.some(m => m.status === 'missed');
  
  const completionRate = medications.length > 0 
    ? Math.round((takenMeds.length / medications.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-softIvory pb-20 relative font-medium">
      {successMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-charcoal text-white rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-softMint" />
          <span className="font-bold text-sm tracking-tight">{successMessage}</span>
        </div>
      )}

      {hasMissedDoses && (
        <div className="bg-careRose/20 border-b border-careRose/30 py-5 px-6 md:px-12 flex items-center justify-center gap-4 text-careRose text-sm font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>Care Alert: A dose was missed. Hub members notified.</span>
        </div>
      )}

      <section className="px-6 md:px-12 pt-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-mutedTeal font-bold uppercase tracking-widest text-xs">
              <LayoutDashboard className="w-4 h-4" />
              Family Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal tracking-tight">{hubName || 'Dashboard'}</h1>
            <div className="flex items-center gap-4">
              <button 
                className="group px-6 py-4 bg-white border-2 border-paleSage rounded-3xl flex items-center gap-6 soft-shadow transition-all active:scale-95" 
                onClick={handleCopyCode}
                title="Copy join code"
              >
                <span className="text-xs font-black uppercase tracking-[0.2em] text-softAsh">Join Code</span>
                <span className="font-mono font-black text-mutedTeal text-2xl">{hubCode}</span>
                <div className="p-2 bg-mutedTeal text-white rounded-xl">
                   {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </div>
              </button>
            </div>
          </div>

          <button onClick={openAddModal} className="flex items-center gap-3 px-12 py-6 bg-mutedTeal text-white font-extrabold rounded-3xl soft-shadow hover:brightness-95 active:scale-95 transition-all text-xl shadow-lg">
            <Plus className="w-7 h-7" />
            Add Medication
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-extrabold text-charcoal">Daily Tasks</h2>

              {isLoading ? (
                <div className="py-24 flex flex-col items-center gap-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-mutedTeal/20 border-t-mutedTeal"></div>
                  <p className="text-charcoal font-bold tracking-widest uppercase text-xs">Syncing hub...</p>
                </div>
              ) : upcomingMeds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {upcomingMeds.map((med) => {
                    const isMissed = med.status === 'missed';
                    return (
                      <div key={med.id} className={`group relative bg-white rounded-[2.5rem] p-10 border-2 transition-all shadow-md ${isMissed ? 'border-careRose/40' : 'border-paleSage hover:shadow-2xl hover:border-mutedTeal/20'}`}>
                        <div className="flex justify-between items-start mb-10">
                          <div className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isMissed ? 'bg-careRose text-white' : 'bg-mutedTeal text-white'}`}>
                            {isMissed ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {isMissed ? 'Late' : 'Upcoming'}
                          </div>
                          <div className="flex gap-4">
                            <button onClick={(e) => openEditModal(e, med)} className="p-3 bg-lightSand text-charcoal rounded-xl hover:bg-mutedTeal hover:text-white transition-all" aria-label="Edit"><Pencil className="w-5 h-5" /></button>
                            <button onClick={(e) => triggerDeleteConfirm(e, med)} className="p-3 bg-lightSand text-careRose rounded-xl hover:bg-careRose hover:text-white transition-all" aria-label="Delete"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 mb-10">
                          <div className="w-20 h-20 rounded-2xl bg-lightSand flex items-center justify-center text-mutedTeal overflow-hidden border border-paleSage">
                            {med.imageUrl ? <img src={med.imageUrl} className="w-full h-full object-cover" alt={med.name} /> : <Pill className="w-10 h-10" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-2xl font-black text-charcoal truncate mb-1">{med.name}</h3>
                            <p className="text-mutedTeal font-black text-lg">{formatDisplayTime(med.reminderTime)}</p>
                          </div>
                        </div>

                        <div className="p-5 bg-lightSand/50 border border-paleSage rounded-2xl mb-10">
                          <p className="text-charcoal font-bold text-lg">{med.dosage}</p>
                        </div>

                        <button 
                          onClick={() => handleTakeMedicine(med.id)} 
                          className={`w-full py-5 font-black rounded-2xl text-white shadow-xl transition-all active:scale-95 text-lg ${isMissed ? 'bg-careRose' : 'bg-mutedTeal'}`}
                        >
                          Mark as Taken
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-[4rem] p-24 text-center border-2 border-paleSage shadow-sm">
                   <CheckCircle2 className="w-20 h-20 text-mutedTeal mx-auto mb-8" />
                   <p className="text-charcoal text-2xl font-bold">All tasks completed for today.</p>
                   <p className="text-mutedSlate mt-2">The hub is in good health.</p>
                </div>
              )}
            </div>

            {takenMeds.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-3xl font-extrabold text-charcoal">Completed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {takenMeds.map((med) => (
                    <div key={med.id} className="bg-paleSage/30 rounded-[2.5rem] p-8 border-2 border-paleSage">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-black uppercase tracking-widest text-mutedTeal bg-softMint px-4 py-1.5 rounded-full">Completed</span>
                        <button onClick={() => handleUntakeMedicine(med.id)} className="p-3 text-softAsh hover:text-mutedTeal bg-white rounded-xl shadow-sm transition-all">
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="text-xl font-black text-charcoal line-through decoration-charcoal/40">{med.name}</h3>
                      <p className="text-softAsh font-bold mt-1">Logged at {formatDisplayTime(med.reminderTime)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-10">
            {/* Status Widget */}
            <div className="bg-charcoal text-white rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-mutedTeal/20 rounded-bl-full" />
               <ShieldCheck className="w-12 h-12 text-softMint mb-10 relative z-10" />
               <h3 className="text-3xl font-black leading-tight mb-6 relative z-10">Family Shield</h3>
               <p className="text-lg text-paleSage font-medium leading-relaxed relative z-10">
                 MedTrack monitors your family hub. Late doses are flagged to all members to ensure consistent care.
               </p>
            </div>
            
            {/* Progress Widget */}
            <div className="bg-white rounded-[3.5rem] p-12 shadow-md border-2 border-paleSage space-y-8">
               <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black text-charcoal">Daily Status</h3>
                 <span className="text-3xl font-black text-mutedTeal">{completionRate}%</span>
               </div>
               <div className="w-full bg-lightSand h-5 rounded-full overflow-hidden border border-paleSage">
                  <div className="bg-mutedTeal h-full transition-all duration-1000" style={{ width: `${completionRate}%` }} />
               </div>
               <p className="text-lg text-charcoal font-bold leading-tight">
                 Hub progress is <span className="text-mutedTeal">{completionRate}%</span> complete.
               </p>
               <p className="text-mutedSlate text-sm">Keep up the great teamwork!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal - Improved visibility */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" onClick={() => !isSubmitting && setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[4rem] p-14 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-4xl font-black text-charcoal mb-10">{editId ? 'Edit Medicine' : 'New Medicine'}</h2>

            <form onSubmit={handleSaveMedication} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-charcoal ml-1">Medication Name</label>
                <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)} required className="w-full h-16 bg-lightSand border-2 border-paleSage rounded-2xl px-8 text-charcoal font-black focus:outline-none focus:border-mutedTeal" placeholder="e.g. Daily Vitamins" />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-charcoal ml-1">Dosage</label>
                  <input type="text" placeholder="e.g. 1 Tablet" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} className="w-full h-16 bg-lightSand border-2 border-paleSage rounded-2xl px-8 font-black text-charcoal focus:outline-none focus:border-mutedTeal" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-charcoal ml-1">Reminder Time</label>
                  <input type="time" value={medTime} onChange={(e) => setMedTime(e.target.value)} required className="w-full h-16 bg-lightSand border-2 border-paleSage rounded-2xl px-8 font-black text-charcoal focus:outline-none focus:border-mutedTeal" />
                </div>
              </div>

              <div className="flex gap-6 pt-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 font-black text-mutedSlate text-xl hover:text-charcoal transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-5 bg-mutedTeal text-white font-black rounded-3xl text-xl shadow-lg hover:brightness-95 active:scale-95 transition-all">
                  {isSubmitting ? 'Saving...' : 'Save to Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal - Solid background */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[3.5rem] p-12 text-center shadow-2xl border-2 border-paleSage">
             <div className="w-24 h-24 bg-careRose/10 rounded-full flex items-center justify-center text-careRose mx-auto mb-8">
               <AlertTriangle className="w-12 h-12" />
             </div>
             <h2 className="text-3xl font-black mb-6 text-charcoal">Remove?</h2>
             <p className="text-mutedSlate mb-12 font-bold text-lg">Permanently delete "{medToDelete?.name}" from your hub?</p>
             <div className="flex flex-col gap-4">
               <button onClick={confirmDeleteMedication} className="w-full py-6 bg-careRose text-white font-black rounded-3xl text-xl shadow-xl hover:brightness-110 active:scale-95 transition-all">Yes, Delete</button>
               <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-charcoal font-black text-lg hover:bg-lightSand rounded-2xl transition-all">No, Keep It</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

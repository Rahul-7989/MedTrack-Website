
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
    <div className="min-h-screen bg-softIvory pb-20 relative font-light">
      {successMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-charcoal text-white rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-softMint" />
          <span className="font-bold text-sm tracking-tight">{successMessage}</span>
        </div>
      )}

      {hasMissedDoses && (
        <div className="bg-careRose/10 border-b border-careRose/20 py-5 px-6 md:px-12 flex items-center justify-center gap-4 text-careRose text-sm font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>Care Alert: A dose was missed. Hub members notified.</span>
        </div>
      )}

      <section className="px-6 md:px-12 pt-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-mutedTeal font-bold uppercase tracking-widest text-[10px]">
              <LayoutDashboard className="w-3 h-3" />
              Family Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal tracking-tight">{hubName || 'Dashboard'}</h1>
            <div className="flex items-center gap-4">
              <button 
                className="group px-5 py-3 bg-white border border-softAsh/10 rounded-2xl flex items-center gap-4 soft-shadow transition-all active:scale-95" 
                onClick={handleCopyCode}
                title="Copy join code"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-softAsh">Join Code</span>
                <span className="font-mono font-black text-mutedTeal text-xl">{hubCode}</span>
                <div className="p-2 bg-softMint/20 rounded-lg text-mutedTeal">
                   {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
              </button>
            </div>
          </div>

          <button onClick={openAddModal} className="flex items-center gap-3 px-10 py-5 bg-mutedTeal text-white font-extrabold rounded-2xl soft-shadow hover:-translate-y-1 active:scale-95 transition-all text-lg">
            <Plus className="w-6 h-6" />
            Add Medication
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-8">
              <h2 className="text-2xl font-extrabold text-charcoal">Daily Tasks</h2>

              {isLoading ? (
                <div className="py-24 flex flex-col items-center gap-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-mutedTeal/20 border-t-mutedTeal"></div>
                  <p className="text-softAsh font-bold tracking-widest uppercase text-[10px]">Syncing hub...</p>
                </div>
              ) : upcomingMeds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {upcomingMeds.map((med) => {
                    const isMissed = med.status === 'missed';
                    return (
                      <div key={med.id} className={`group relative bg-white rounded-[2.5rem] p-8 border transition-all ${isMissed ? 'border-careRose/30' : 'border-softAsh/5 shadow-sm hover:shadow-xl'}`}>
                        <div className="flex justify-between items-start mb-8">
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isMissed ? 'bg-careRose/10 text-careRose' : 'bg-paleSage text-mutedSlate'}`}>
                            {isMissed ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {isMissed ? 'Late' : 'Upcoming'}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={(e) => openEditModal(e, med)} className="p-2 text-softAsh hover:text-mutedTeal" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                            <button onClick={(e) => triggerDeleteConfirm(e, med)} className="p-2 text-softAsh hover:text-careRose" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                          <div className="w-16 h-16 rounded-[1.2rem] bg-lightSand flex items-center justify-center text-mutedTeal overflow-hidden border border-softAsh/5">
                            {med.imageUrl ? <img src={med.imageUrl} className="w-full h-full object-cover" alt={med.name} /> : <Pill className="w-8 h-8 opacity-30" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-extrabold text-charcoal truncate">{med.name}</h3>
                            <p className="text-mutedTeal font-bold text-sm">{formatDisplayTime(med.reminderTime)}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-paleSage/30 rounded-2xl mb-8">
                          <span className="text-charcoal font-medium text-sm">{med.dosage}</span>
                        </div>

                        <button 
                          onClick={() => handleTakeMedicine(med.id)} 
                          className={`w-full py-4 font-extrabold rounded-2xl text-white shadow-lg transition-all active:scale-95 ${isMissed ? 'bg-careRose' : 'bg-mutedTeal'}`}
                        >
                          Mark as Taken
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-softAsh/10">
                   <CheckCircle2 className="w-16 h-16 text-mutedTeal opacity-20 mx-auto mb-6" />
                   <p className="text-mutedSlate font-medium">All tasks completed for today.</p>
                </div>
              )}
            </div>

            {takenMeds.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-extrabold text-charcoal">Completed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {takenMeds.map((med) => (
                    <div key={med.id} className="bg-white/50 rounded-[2.5rem] p-8 border border-softAsh/10 opacity-60">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-mutedTeal">Completed</span>
                        <button onClick={() => handleUntakeMedicine(med.id)} className="p-2 text-softAsh hover:text-mutedTeal">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-mutedSlate line-through">{med.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-10">
            {/* Status Widget */}
            <div className="bg-charcoal text-white rounded-[3rem] p-10 soft-shadow">
               <ShieldCheck className="w-10 h-10 text-softMint mb-8" />
               <h3 className="text-2xl font-extrabold leading-tight mb-4">Family Shield</h3>
               <p className="text-base text-softAsh font-light leading-relaxed">
                 MedTrack monitors your hub's adherence. Late doses are flagged to all members to ensure no one is forgotten.
               </p>
            </div>
            
            {/* Progress Widget */}
            <div className="bg-white rounded-[3rem] p-10 soft-shadow border border-softAsh/10 space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-extrabold text-charcoal">Status</h3>
                 <span className="text-2xl font-black text-mutedTeal">{completionRate}%</span>
               </div>
               <div className="w-full bg-lightSand h-3 rounded-full overflow-hidden">
                  <div className="bg-mutedTeal h-full transition-all duration-1000" style={{ width: `${completionRate}%` }} />
               </div>
               <p className="text-sm text-mutedSlate">
                 Your family hub is {completionRate}% through today's care tasks.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal - Simplified */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-md" onClick={() => !isSubmitting && setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[3.5rem] p-12 soft-shadow animate-in zoom-in-95">
            <h2 className="text-3xl font-extrabold text-charcoal mb-8">{editId ? 'Edit Medicine' : 'New Medicine'}</h2>

            <form onSubmit={handleSaveMedication} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-softAsh">Name</label>
                <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)} required className="w-full h-14 bg-lightSand border border-softAsh/10 rounded-2xl px-6 text-charcoal font-bold focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-softAsh">Dosage</label>
                  <input type="text" placeholder="e.g. 1 Pill" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} className="w-full h-14 bg-lightSand border border-softAsh/10 rounded-2xl px-6 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-softAsh">Time</label>
                  <input type="time" value={medTime} onChange={(e) => setMedTime(e.target.value)} required className="w-full h-14 bg-lightSand border border-softAsh/10 rounded-2xl px-6 font-bold" />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-softAsh">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-mutedTeal text-white font-extrabold rounded-2xl">
                  {isSubmitting ? 'Saving...' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 text-center shadow-2xl">
             <h2 className="text-2xl font-extrabold mb-4">Remove?</h2>
             <p className="text-mutedSlate mb-10">Delete "{medToDelete?.name}" from your family hub?</p>
             <div className="flex flex-col gap-4">
               <button onClick={confirmDeleteMedication} className="w-full py-5 bg-careRose text-white font-extrabold rounded-2xl">Confirm Delete</button>
               <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-softAsh font-bold">Cancel</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

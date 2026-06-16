'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserSquare2, Gift, ImageIcon, Users, MessageSquare, 
  Upload, Trash2, Copy, Plus, Save, Loader2, CheckCircle2,
  Menu, X, LayoutDashboard, XCircle, LogOut
} from 'lucide-react';

export default function AdminDashboard() {
  const [config, setConfig] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [wishes, setWishes] = useState<any[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(async data => {
        if (data.akadDate) data.akadDate = new Date(data.akadDate).toISOString().slice(0, 16);
        if (data.resepsiDate) data.resepsiDate = new Date(data.resepsiDate).toISOString().slice(0, 16);
        
        if (data && typeof data.galleryPhotos === 'string') {
          try { data.galleryPhotos = JSON.parse(data.galleryPhotos); } catch(e) { data.galleryPhotos = []; }
        } else {
          data.galleryPhotos = [];
        }

        setConfig(data);

        const guestRes = await fetch('/api/guests');
        const guestData = await guestRes.json();
        setGuests(guestData);

        const wishRes = await fetch('/api/wishes');
        const wishData = await wishRes.json();
        setWishes(wishData);

        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setConfig({ ...config, [fieldName]: data.url });
      } else {
        alert('Gagal mengupload file.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengupload.');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const newPhotos = [...(config.galleryPhotos || [])];

    for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) newPhotos.push(data.url);
        } catch (err) {
            console.error(err);
        }
    }

    setConfig({ ...config, galleryPhotos: newPhotos });
    setUploading(false);
  };

  const removeGalleryPhoto = (index: number) => {
    const newPhotos = [...config.galleryPhotos];
    newPhotos.splice(index, 1);
    setConfig({ ...config, galleryPhotos: newPhotos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToSave = { ...config };
    dataToSave.akadDate = new Date(dataToSave.akadDate).toISOString();
    dataToSave.resepsiDate = new Date(dataToSave.resepsiDate).toISOString();
    dataToSave.galleryPhotos = JSON.stringify(dataToSave.galleryPhotos);

    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave),
    });
    setSaving(false);
    alert('Konfigurasi berhasil disimpan!');
  };

  const handleAddGuest = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGuestName.trim()) return;
      const res = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newGuestName })
      });
      const newGuest = await res.json();
      setGuests([newGuest, ...guests]);
      setNewGuestName('');
  };

  const handleDeleteGuest = async (id: number) => {
      if (!confirm('Hapus tamu ini?')) return;
      await fetch('/api/guests', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
      });
      setGuests(guests.filter(g => g.id !== id));
  };

  const handleDeleteWish = async (id: number) => {
      if (!confirm('Hapus ucapan tamu ini?')) return;
      await fetch('/api/wishes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
      });
      setWishes(wishes.filter(w => w.id !== id));
  };
  
  const handleCopyLink = (guest: any) => {
      const fullLink = `${window.location.origin}/?to=${guest.slug}`;
      const text = `Kepada Yth. ${guest.name},\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\nBerikut link undangan kami:\n${fullLink}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.\nTerima kasih.`;
      navigator.clipboard.writeText(text);
      
      setCopiedId(guest.id);
      setTimeout(() => setCopiedId(null), 3000);

      if (guest.status === 'Belum Dikirim') {
          fetch('/api/guests', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: guest.id, status: 'Sudah Dikirim' })
          });
          setGuests(guests.map(g => g.id === guest.id ? { ...g, status: 'Sudah Dikirim' } : g));
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p>Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard size={20} /> },
    { id: 'biodata', label: 'Biodata & Acara', icon: <UserSquare2 size={20} /> },
    { id: 'hadiah', label: 'Amplop Digital', icon: <Gift size={20} /> },
    { id: 'media', label: 'Media & Galeri', icon: <ImageIcon size={20} /> },
    { id: 'tamu', label: 'Buku Tamu', icon: <Users size={20} /> },
    { id: 'ucapan', label: 'Daftar Ucapan', icon: <MessageSquare size={20} /> },
  ];

  const totalWishes = wishes.length;
  const totalHadir = wishes.filter(w => w.status === 'hadir').length;
  const totalTidakHadir = wishes.filter(w => w.status === 'tidak_hadir').length;
  const totalTamu = guests.length;
  const terkirim = guests.filter(g => g.status === 'Sudah Dikirim').length;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <h1 className="font-bold text-xl text-primary">Wedding Admin</h1>
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm
                ${activeTab === item.id 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {item.icon}
              {item.label}
            </motion.button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-30">
          <button className="lg:hidden mr-4 text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
          
          {/* --- TAB 0: OVERVIEW --- */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
              <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1 */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all cursor-default">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Users size={28}/></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Tamu</p>
                    <p className="text-3xl font-bold text-gray-800">{totalTamu}</p>
                  </div>
                </motion.div>
                {/* Card 2 */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all cursor-default">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 size={28}/></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Hadir (RSVP)</p>
                    <p className="text-3xl font-bold text-gray-800">{totalHadir}</p>
                  </div>
                </motion.div>
                {/* Card 3 */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all cursor-default">
                  <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600"><XCircle size={28}/></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Tidak Hadir</p>
                    <p className="text-3xl font-bold text-gray-800">{totalTidakHadir}</p>
                  </div>
                </motion.div>
                {/* Card 4 */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all cursor-default">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><MessageSquare size={28}/></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Ucapan</p>
                    <p className="text-3xl font-bold text-gray-800">{totalWishes}</p>
                  </div>
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Progress Card */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-6 text-gray-800">Progres Penyebaran Undangan</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Undangan Terkirim</span>
                    <span className="text-sm font-bold text-primary">{terkirim} dari {totalTamu} Tamu</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${totalTamu === 0 ? 0 : (terkirim/totalTamu)*100}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="bg-primary h-3 rounded-full"></motion.div>
                  </div>
                  <p className="text-xs text-gray-400">Pastikan untuk menandai status "Sudah Dikirim" saat Anda membagikan link ke tamu.</p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-6 text-gray-800">Aksi Cepat</h3>
                  <div className="flex gap-4">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('tamu')} className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-4 rounded-xl font-medium transition-colors text-sm flex flex-col items-center justify-center gap-2">
                      <Plus size={20} className="text-primary" />
                      Tambah Tamu
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.open('/', '_blank')} className="flex-1 bg-primary hover:bg-secondary text-white py-4 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 text-sm flex flex-col items-center justify-center gap-2">
                      <LayoutDashboard size={20} />
                      Lihat Undangan
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* --- TAB 1: BIODATA & ACARA --- */}
            {activeTab === 'biodata' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                
                {/* Photo Section */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><UserSquare2 className="text-primary"/> Foto Profil Mempelai</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    {['bride', 'groom'].map((person) => (
                      <div key={person} className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-700 mb-4 capitalize">Foto {person === 'bride' ? 'Wanita' : 'Pria'}</span>
                        <div className="w-32 h-32 rounded-full bg-gray-200 mb-6 shadow-inner overflow-hidden border-4 border-white">
                          {config[`${person}Photo`] ? (
                            <img src={config[`${person}Photo`]} alt={person} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32}/></div>
                          )}
                        </div>
                        <label className="cursor-pointer bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                          <Upload size={16} /> Ganti Foto
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, `${person}Photo`)} disabled={uploading} />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><UserSquare2 className="text-primary"/> Informasi Mempelai</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Wanita</label>
                      <input name="brideName" value={config?.brideName || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pria</label>
                      <input name="groomName" value={config?.groomName || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Orang Tua Wanita</label>
                      <input name="brideParents" value={config?.brideParents || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Orang Tua Pria</label>
                      <input name="groomParents" value={config?.groomParents || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Wanita</label>
                      <input name="brideIG" value={config?.brideIG || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Pria</label>
                      <input name="groomIG" value={config?.groomIG || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><UserSquare2 className="text-primary"/> Waktu & Tempat Acara</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akad</label>
                      <input type="datetime-local" name="akadDate" value={config?.akadDate || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Resepsi</label>
                      <input type="datetime-local" name="resepsiDate" value={config?.resepsiDate || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Akad</label>
                      <input name="akadLocation" value={config?.akadLocation || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Resepsi</label>
                      <input name="resepsiLocation" value={config?.resepsiLocation || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link Google Maps (URL)</label>
                      <input name="mapsLink" value={config?.mapsLink || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-blue-600" />
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* --- TAB 2: HADIAH / AMPLOP --- */}
            {activeTab === 'hadiah' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><Gift className="text-primary"/> Amplop Digital</h3>
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Bank / E-Wallet</label>
                    <input name="bankName" value={config?.bankName || ''} onChange={handleChange} placeholder="BCA / Mandiri / GoPay" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Rekening</label>
                    <input name="bankAccount" value={config?.bankAccount || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pemilik Rekening</label>
                    <input name="bankHolder" value={config?.bankHolder || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- TAB 3: MEDIA & GALERI --- */}
            {activeTab === 'media' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ImageIcon className="text-primary"/> Musik Latar (Backsound)</h3>
                  <p className="text-sm text-gray-500 mb-6">Unggah file audio MP3 untuk diputar secara otomatis di latar belakang.</p>
                  
                  <div className="flex flex-col gap-4 max-w-md">
                    <label className="cursor-pointer bg-white px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium hover:border-primary transition-colors flex items-center justify-center gap-2">
                      <Upload size={18} /> Pilih File MP3
                      <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'musicUrl')} disabled={uploading} />
                    </label>
                    {config.musicUrl && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Lagu Saat Ini:</span>
                        <audio controls src={config.musicUrl} className="w-full h-10" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ImageIcon className="text-primary"/> Galeri Pre-Wedding</h3>
                  <p className="text-sm text-gray-500 mb-6">Pilih beberapa foto sekaligus untuk menambahkannya ke galeri. Foto terbaik memiliki rasio portrait.</p>
                  
                  <label className="inline-flex cursor-pointer bg-primary text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors items-center gap-2 mb-8">
                    <Plus size={18} /> Tambah Foto
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploading} />
                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {config.galleryPhotos?.map((photo: string, index: number) => (
                      <div key={index} className="relative aspect-[4/5] rounded-xl overflow-hidden group shadow-sm border border-gray-100">
                        <img src={photo} alt="Gallery" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => removeGalleryPhoto(index)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button Container */}
            {(activeTab === 'biodata' || activeTab === 'hadiah' || activeTab === 'media') && (
              <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-20 flex justify-end px-6 lg:px-10">
                <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20">
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            )}
          </form>

          {/* --- TAB 4: TAMU / LINK --- */}
          {activeTab === 'tamu' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Users className="text-primary"/> Generate Link Tamu</h3>
                <p className="text-sm text-gray-500 mb-6">Ketik nama tamu untuk membuatkan link undangan khusus untuk mereka secara otomatis.</p>
                
                <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                  <input 
                    type="text" value={newGuestName} onChange={e => setNewGuestName(e.target.value)} 
                    placeholder="Contoh: Budi Santoso & Keluarga" required
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <button type="submit" className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-secondary transition-colors whitespace-nowrap">
                    <Plus size={18} /> Tambah Tamu
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-medium">
                      <tr>
                        <th className="px-6 py-4">Nama Tamu</th>
                        <th className="px-6 py-4">Link Unik</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {guests.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada data tamu.</td></tr>
                      ) : guests.map((guest: any) => (
                        <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">{guest.name}</td>
                          <td className="px-6 py-4 text-blue-600 font-mono text-xs bg-blue-50/50 rounded inline-flex mt-3 ml-6 mb-3 px-2 py-1">/?to={guest.slug}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                              ${guest.status === 'Sudah Dikirim' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                              {guest.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex items-center justify-end gap-2">
                            <button onClick={() => handleCopyLink(guest)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium text-xs">
                              {copiedId === guest.id ? <CheckCircle2 size={14} className="text-emerald-600"/> : <Copy size={14} />} 
                              {copiedId === guest.id ? 'Tersalin!' : 'Copy WA'}
                            </button>
                            <button onClick={() => handleDeleteGuest(guest.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- TAB 5: UCAPAN / WISHES --- */}
          {activeTab === 'ucapan' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2"><MessageSquare className="text-primary"/> Daftar Ucapan & RSVP</h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{wishes.length} Pesan</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">Nama / Status</th>
                      <th className="px-6 py-4 w-1/2">Pesan Ucapan</th>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {wishes.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada ucapan.</td></tr>
                    ) : wishes.map(wish => (
                      <tr key={wish.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800 mb-1">{wish.name}</div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                            ${wish.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {wish.status === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 leading-relaxed min-w-[300px] whitespace-normal">
                          {wish.message}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(wish.createdAt).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteWish(wish.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {/* Bottom Padding for floating save button */}
          <div className="h-24"></div>

        </div>
      </main>

    </div>
  );
}

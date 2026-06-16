'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { MailOpen, MapPin, Calendar, Clock, Copy, Camera, Send, Disc3, X, CheckCircle2, XCircle, Check, Plus, MessageSquare } from 'lucide-react';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';

// --- ADVANCED ANIMATION COMPONENTS ---

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

const AnimatedText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, damping: 12, stiffness: 100 } },
    hidden: { opacity: 0, y: 15, filter: "blur(5px)", transition: { type: "spring" as const, damping: 12, stiffness: 100 } },
  };

  return (
    <motion.div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center" }} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className={className}>
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

const FloatingParticles = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-accent/40 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
          style={{ width: Math.random() * 4 + 2, height: Math.random() * 4 + 2 }}
          initial={{ opacity: 0, x: Math.random() * 480, y: Math.random() * 1000 + 400 }}
          animate={{ opacity: [0, Math.random() * 0.6 + 0.1, 0], y: [null, Math.random() * -1000], x: [null, Math.random() * 480] }}
          transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
        />
      ))}
    </div>
  );
};

const InteractiveCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Only show custom cursor if device has a mouse (pointer: fine)
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('button, a, input, select, textarea, .magnetic'));
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Hide the default cursor for the whole page when custom cursor is active
  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouchDevice) {
      document.body.style.cursor = 'none';
      const style = document.createElement('style');
      style.innerHTML = `* { cursor: none !important; }`;
      document.head.appendChild(style);
      return () => { document.body.style.cursor = 'auto'; document.head.removeChild(style); };
    }
  }, []);

  return (
    <>
      <motion.div className="fixed top-0 left-0 w-2 h-2 bg-accent rounded-full pointer-events-none z-[9999]" animate={{ x: mousePosition.x - 4, y: mousePosition.y - 4, scale: isHovering ? 0 : 1 }} transition={{ type: "spring", stiffness: 1000, damping: 28, mass: 0.1 }} />
      <motion.div className="fixed top-0 left-0 w-8 h-8 border rounded-full pointer-events-none z-[9998]" animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16, scale: isHovering ? 1.5 : 1, borderColor: isHovering ? "rgba(6, 78, 59, 0.4)" : "rgba(212, 175, 55, 0.6)", backgroundColor: isHovering ? "rgba(212, 175, 55, 0.1)" : "transparent" }} transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.5 }} />
    </>
  );
};

const MagneticButton = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div className={`magnetic cursor-pointer ${className || ''}`} ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} onClick={onClick}>
      {children}
    </motion.div>
  );
};

export default function InvitationClient({ config, initialWishes, guestName }: { config: any, initialWishes: any[], guestName: string }) {
  const [liveConfig, setLiveConfig] = useState(config);
  
  const parsedGalleryPhotos = React.useMemo(() => {
    if (typeof liveConfig.galleryPhotos === 'string') {
        try { return JSON.parse(liveConfig.galleryPhotos) || []; } catch(e) { return []; }
    }
    return liveConfig.galleryPhotos || [];
  }, [liveConfig.galleryPhotos]);

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [wishes, setWishes] = useState<any[]>(initialWishes || []);
  const [rsvpName, setRsvpName] = useState(guestName !== 'Tamu Undangan' ? guestName : '');
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) document.body.classList.add('locked');
    else document.body.classList.remove('locked');
    return () => document.body.classList.remove('locked');
  }, [isOpen]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#064E3B', '#D4AF37', '#ffffff'], zIndex: 10000 });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#064E3B', '#D4AF37', '#ffffff'], zIndex: 10000 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [configRes, wishesRes] = await Promise.all([ fetch('/api/config', { cache: 'no-store' }), fetch('/api/wishes', { cache: 'no-store' }) ]);
        if (configRes.ok) setLiveConfig(await configRes.json());
        if (wishesRes.ok) setWishes(await wishesRes.json());
      } catch (err) { console.error('Polling error:', err); }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const weddingDate = new Date(liveConfig.akadDate);
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;
      if (distance < 0) { setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' }); return; }
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days: d < 10 ? '0' + d : d.toString(), hours: h < 10 ? '0' + h : h.toString(), minutes: m < 10 ? '0' + m : m.toString(), seconds: s < 10 ? '0' + s : s.toString() });
    };
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [liveConfig.akadDate]);

  const handleOpen = () => {
    setIsOpen(true);
    if (audioRef.current) { audioRef.current.play().catch(e => console.log('Audio error:', e)); setIsPlaying(true); }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play().catch(e => console.log('Audio play error', e)); }
    setIsPlaying(!isPlaying);
  };

  const copyRekening = () => {
    navigator.clipboard.writeText(liveConfig.bankAccount).then(() => {
      setCopySuccess(true); setTimeout(() => setCopySuccess(false), 3000);
      fireConfetti();
    });
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
        const res = await fetch('/api/wishes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: rsvpName, status: rsvpStatus, message: rsvpMessage }) });
        if (res.ok) { const newWish = await res.json(); setWishes([newWish, ...wishes]); setRsvpMessage(''); fireConfetti(); } 
        else { alert('Gagal mengirim ucapan, silakan coba lagi.'); }
    } catch (err) { alert('Terjadi kesalahan koneksi.'); } finally { setIsSubmitting(false); }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (!liveConfig) return <div className="p-8 text-center text-primary">Data undangan tidak ditemukan.</div>;

  const fadeInUp = { hidden: { opacity: 0, y: 40, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, duration: 1.2, bounce: 0.2 } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } } };

  return (
    <div className="relative min-h-screen bg-stone-50 overflow-hidden selection:bg-accent selection:text-primary flex justify-center text-stone-800">
      <InteractiveCursor />
      {/* --- COVER PAGE --- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ clipPath: "circle(150% at 50% 50%)", filter: "blur(0px)" }} 
            exit={{ clipPath: "circle(0% at 50% 50%)", filter: "blur(10px)", opacity: 0 }} 
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center w-full max-w-[480px] mx-auto shadow-2xl bg-white"
          >
            <motion.div 
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{ backgroundImage: "url('/background.png')" }}
              initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-white/60 backdrop-blur-[1px]"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-between h-full py-20 text-primary w-full px-6 text-center">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="flex flex-col items-center space-y-2">
                <p className="text-sm tracking-[0.2em] uppercase text-secondary">Kepada Yth.</p>
                <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-primary">{guestName}</h2>
                <p className="text-sm italic text-stone-500">Di Tempat</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 1 }} className="flex flex-col items-center w-full">
                <p className="text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-secondary">The Wedding Of</p>
                
                <div className="font-great-vibes text-7xl md:text-8xl text-accent flex items-center justify-center gap-4 w-full">
                  <motion.span initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1, type: "spring" }}>{liveConfig.brideName.charAt(0)}</motion.span>
                  <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.3, type: "spring" }} className="font-playfair text-4xl text-primary/80">&</motion.span>
                  <motion.span initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5, type: "spring" }}>{liveConfig.groomName.charAt(0)}</motion.span>
                </div>
                
                <h1 className="mt-6 text-3xl font-playfair font-bold tracking-wide text-primary">
                  <AnimatedText text={`${liveConfig.brideName.split(' ')[0]} & ${liveConfig.groomName.split(' ')[0]}`} delay={1.8} />
                </h1>
              </motion.div>

              <MagneticButton>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 0.8 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleOpen}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full uppercase tracking-widest text-sm transition-all duration-300 shadow-xl hover:shadow-[0_10px_30px_rgba(6,78,59,0.3)]"
                >
                  <MailOpen size={18} className="relative z-10 group-hover:-translate-y-1 transition-transform" />
                  <span className="relative z-10">Buka Undangan</span>
                </motion.button>
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <div ref={containerRef} className={`w-full max-w-[480px] bg-stone-50 min-h-screen shadow-2xl relative overflow-x-hidden ${!isOpen ? 'hidden' : 'block'}`}>
        {/* Fixed Viewport Background */}
        <motion.div 
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-screen pointer-events-none opacity-60 bg-cover bg-center z-0" 
          style={{ backgroundImage: "url('/inner-bg.png')", y: bgY }} 
        />
        <div className="absolute inset-0 h-full pointer-events-none bg-gradient-to-b from-stone-50/30 via-white/50 to-stone-100/90 backdrop-blur-[1px] z-0"></div>
        <FloatingParticles />
        
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-16 px-6 text-center z-10 min-h-[70vh] flex flex-col justify-center items-center overflow-hidden">
          {/* Floral Arch Background */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }} 
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="absolute inset-0 flex justify-center items-center pointer-events-none z-0"
          >
            <img src="/hero-frame.png" alt="Floral Frame" className="w-[140%] max-w-[550px] object-contain mix-blend-multiply opacity-90 scale-110" />
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="relative z-10 mt-8">
            <motion.p variants={fadeInUp} className="text-xs tracking-[0.2em] uppercase text-secondary mb-6 font-semibold">The Wedding Of</motion.p>
            <AnimatedText text={liveConfig.brideName.split(' ')[0]} className="font-great-vibes text-6xl md:text-7xl text-primary block mb-2 drop-shadow-sm" delay={0.1} />
            <motion.span variants={fadeInUp} className="font-great-vibes text-accent text-5xl inline-block mx-4 drop-shadow-sm">&</motion.span>
            <AnimatedText text={liveConfig.groomName.split(' ')[0]} className="font-great-vibes text-6xl md:text-7xl text-primary block mb-10 drop-shadow-sm" delay={0.3} />
            <motion.p variants={fadeInUp} className="font-playfair text-lg text-primary font-bold tracking-widest uppercase border-y border-accent/40 py-4 max-w-[280px] mx-auto bg-white/40 backdrop-blur-sm rounded-xl">{formatDate(liveConfig.akadDate)}</motion.p>
          </motion.div>
        </section>

        {/* QUOTE SECTION */}
        <section className="relative py-16 px-6 text-center z-10">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.05)]">
            <motion.p variants={fadeInUp} className="text-2xl text-primary font-serif leading-loose mb-6 drop-shadow-sm" dir="rtl">
              وَمِنْ ءَايَٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِى ذَٰلِكَ لَءَايَٰتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
            </motion.p>
            <motion.p variants={fadeInUp} className="text-[13px] text-stone-600 font-light leading-relaxed mb-6 italic">
              "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir."
            </motion.p>
            <motion.p variants={fadeInUp} className="text-xs font-bold text-accent tracking-widest uppercase">
              (QS. Ar-Rum: 21)
            </motion.p>
          </motion.div>
        </section>

        {/* PROFILE SECTION */}
        <section className="py-24 px-6 bg-white/70 backdrop-blur-xl relative z-10 border-t border-primary/5 rounded-t-[3rem]">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center">
            <motion.h2 variants={fadeInUp} className="font-playfair text-3xl text-primary mb-16 flex flex-col items-center gap-4">
              Mempelai
              <span className="w-12 h-0.5 bg-accent rounded-full"></span>
            </motion.h2>

            <div className="flex flex-col gap-16">
              {/* Bride */}
              <motion.div variants={fadeInUp} className="perspective-1000">
                <TiltCard className="flex flex-col items-center bg-white/80 backdrop-blur-md p-10 rounded-[2rem] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.05)]">
                  <div className="w-48 h-48 rounded-full border-[6px] border-white p-1 mb-6 shadow-xl relative overflow-hidden group">
                    {liveConfig.bridePhoto ? (
                      <img src={liveConfig.bridePhoto} alt="Bride" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-accent font-great-vibes text-6xl rounded-full">{liveConfig.brideName.charAt(0)}</div>
                    )}
                  </div>
                  <h3 className="font-great-vibes text-5xl text-primary mb-3">{liveConfig.brideName}</h3>
                  <p className="text-sm text-stone-500 mb-6 font-light">{liveConfig.brideParents}</p>
                  {liveConfig.brideIG && (
                    <a href={`https://instagram.com/${liveConfig.brideIG.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary hover:text-primary transition-colors border border-primary/20 px-6 py-3 rounded-full bg-white hover:bg-stone-50">
                      <Camera size={14} /> {liveConfig.brideIG}
                    </a>
                  )}
                </TiltCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="font-great-vibes text-6xl text-accent">&</motion.div>

              {/* Groom */}
              <motion.div variants={fadeInUp} className="perspective-1000">
                <TiltCard className="flex flex-col items-center bg-white/80 backdrop-blur-md p-10 rounded-[2rem] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.05)]">
                  <div className="w-48 h-48 rounded-full border-[6px] border-white p-1 mb-6 shadow-xl relative overflow-hidden group">
                    {liveConfig.groomPhoto ? (
                      <img src={liveConfig.groomPhoto} alt="Groom" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-accent font-great-vibes text-6xl rounded-full">{liveConfig.groomName.charAt(0)}</div>
                    )}
                  </div>
                  <h3 className="font-great-vibes text-5xl text-primary mb-3">{liveConfig.groomName}</h3>
                  <p className="text-sm text-stone-500 mb-6 font-light">{liveConfig.groomParents}</p>
                  {liveConfig.groomIG && (
                    <a href={`https://instagram.com/${liveConfig.groomIG.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary hover:text-primary transition-colors border border-primary/20 px-6 py-3 rounded-full bg-white hover:bg-stone-50">
                      <Camera size={14} /> {liveConfig.groomIG}
                    </a>
                  )}
                </TiltCard>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* EVENT SECTION */}
        <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-white/80 backdrop-blur-xl text-stone-800 relative z-10 border-y border-primary/5">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center relative z-10">
            <motion.h2 variants={fadeInUp} className="font-playfair text-3xl text-primary mb-16 flex flex-col items-center gap-4">
              Waktu & Tempat
              <span className="w-12 h-0.5 bg-accent rounded-full"></span>
            </motion.h2>

            <div className="flex flex-col gap-8">
              <motion.div variants={fadeInUp} className="relative group">
                <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-[2rem] text-left border border-white shadow-[0_15px_30px_rgba(0,0,0,0.04)]">
                  <h3 className="font-playfair text-3xl text-primary mb-6 font-semibold">Akad Nikah</h3>
                  <div className="space-y-4 text-sm text-stone-600 font-light tracking-wide">
                    <p className="flex items-center gap-4"><Calendar className="text-accent shrink-0" size={20} /> <span>{formatDate(liveConfig.akadDate)}</span></p>
                    <p className="flex items-center gap-4"><Clock className="text-accent shrink-0" size={20} /> <span>{formatTime(liveConfig.akadDate)} WIB</span></p>
                    <p className="flex items-start gap-4"><MapPin className="text-accent shrink-0 mt-1" size={20} /> <span className="leading-relaxed">{liveConfig.akadLocation}</span></p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative group">
                <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-[2rem] text-left border border-white shadow-[0_15px_30px_rgba(0,0,0,0.04)]">
                  <h3 className="font-playfair text-3xl text-primary mb-6 font-semibold">Resepsi</h3>
                  <div className="space-y-4 text-sm text-stone-600 font-light tracking-wide">
                    <p className="flex items-center gap-4"><Calendar className="text-accent shrink-0" size={20} /> <span>{formatDate(liveConfig.resepsiDate)}</span></p>
                    <p className="flex items-center gap-4"><Clock className="text-accent shrink-0" size={20} /> <span>{formatTime(liveConfig.resepsiDate)} WIB</span></p>
                    <p className="flex items-start gap-4"><MapPin className="text-accent shrink-0 mt-1" size={20} /> <span className="leading-relaxed">{liveConfig.resepsiLocation}</span></p>
                  </div>
                </div>
              </motion.div>
            </div>

            {liveConfig.mapsLink && (
              <motion.div variants={fadeInUp} className="mt-16">
                <a href={liveConfig.mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-medium text-sm hover:bg-secondary transition-colors shadow-xl">
                  <MapPin size={18} /> Arahkan ke Lokasi (Google Maps)
                </a>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* COUNTDOWN SECTION */}
        <section className="py-20 px-6 bg-white/60 backdrop-blur-md relative z-10">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center">
            <motion.h2 variants={fadeInUp} className="font-playfair text-3xl text-primary mb-12">Menuju Hari Bahagia</motion.h2>
            <motion.div variants={fadeInUp} className="flex justify-center gap-4">
              {[
                { label: 'Hari', value: timeLeft.days }, { label: 'Jam', value: timeLeft.hours },
                { label: 'Menit', value: timeLeft.minutes }, { label: 'Detik', value: timeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} className="w-20 py-5 bg-white rounded-[1.5rem] flex flex-col items-center shadow-sm border border-primary/5">
                  <span className="font-playfair text-4xl text-primary font-bold mb-2">{item.value}</span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* GALLERY SECTION */}
        {parsedGalleryPhotos.length > 0 && (
          <section className="py-24 px-6 bg-transparent relative z-10">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center">
              <motion.h2 variants={fadeInUp} className="font-playfair text-3xl text-primary mb-12 flex flex-col items-center gap-4">
                Galeri Bahagia
                <span className="w-12 h-0.5 bg-accent rounded-full"></span>
              </motion.h2>
              <div className="grid grid-cols-2 gap-4">
                {parsedGalleryPhotos.map((photo: string, idx: number) => (
                  <motion.div 
                    variants={fadeInUp} key={idx} 
                    className="aspect-[4/5] rounded-[1.5rem] overflow-hidden cursor-pointer group relative shadow-lg ring-1 ring-white"
                    onClick={() => setLightboxImg(photo)}
                  >
                    <img src={photo} alt="Gallery" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                       <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 shadow-xl">
                          <Plus size={24} />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* GIFT SECTION */}
        <section className="py-24 px-6 bg-white/70 backdrop-blur-xl relative z-10 border-y border-white">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center">
            <motion.h2 variants={fadeInUp} className="font-playfair text-3xl text-primary mb-6 flex flex-col items-center gap-4">
              Amplop Digital
              <span className="w-12 h-0.5 bg-accent rounded-full"></span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-sm text-stone-500 mb-12 px-4 leading-relaxed font-light">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih untuk kami, dapat melalui:
            </motion.p>
            
            <TiltCard>
              <motion.div variants={fadeInUp} className="bg-white p-8 rounded-[2rem] border border-primary/10 shadow-[0_20px_40px_rgba(0,0,0,0.06)] text-left relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                
                <h3 className="font-playfair text-2xl text-primary font-bold mb-3 relative z-10">{liveConfig.bankName}</h3>
                <p className="text-3xl tracking-widest font-mono text-stone-700 mb-2 relative z-10">{liveConfig.bankAccount}</p>
                <p className="text-sm text-stone-400 mb-8 uppercase tracking-[0.2em] relative z-10 font-light">a.n. {liveConfig.bankHolder}</p>
                
                <button 
                  onClick={copyRekening}
                  className="relative z-10 flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-stone-50 hover:bg-primary text-primary hover:text-white transition-colors text-sm font-bold uppercase tracking-widest border border-primary/10"
                >
                  {copySuccess ? <><CheckCircle2 size={18} /> Tersalin!</> : <><Copy size={18} /> Salin Nomor Rekening</>}
                </button>
              </motion.div>
            </TiltCard>
          </motion.div>
        </section>

        {/* RSVP SECTION */}
        <section className="py-24 px-6 bg-transparent relative z-10 pb-12">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <motion.h2 variants={fadeInUp} className="font-playfair text-3xl text-primary mb-12 text-center flex flex-col items-center gap-4">
              RSVP & Ucapan
              <span className="w-12 h-0.5 bg-accent rounded-full"></span>
            </motion.h2>

            <motion.form variants={fadeInUp} onSubmit={handleRSVPSubmit} className="bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-xl mb-16 flex flex-col gap-5 border border-white relative overflow-hidden">
              <input type="text" placeholder="Nama Lengkap" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} required 
                className="w-full px-5 py-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary focus:bg-white transition-all text-sm" />
              
              <div className="relative">
                <select required value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-primary focus:bg-white transition-all text-sm appearance-none">
                  <option value="" disabled className="text-gray-500">Konfirmasi Kehadiran</option>
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Maaf, Tidak Bisa Hadir</option>
                </select>
              </div>

              <textarea rows={4} placeholder="Tuliskan ucapan dan doa Anda..." value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} required
                className="w-full px-5 py-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary focus:bg-white transition-all text-sm resize-none"></textarea>
              
              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 mt-2 bg-primary text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-secondary transition-colors disabled:opacity-70 shadow-lg hover:shadow-xl">
                {isSubmitting ? 'Mengirim...' : <><Send size={18} /> Kirim Ucapan</>}
              </button>
            </motion.form>

            <motion.div variants={fadeInUp} className="bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-xl border border-white">
              <h3 className="font-playfair text-xl text-primary mb-8 flex items-center gap-3">
                <MessageSquare size={20} /> {wishes.length} Ucapan & Doa
              </h3>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar flex flex-col gap-5 pr-4">
                {wishes.length > 0 ? wishes.map((wish: any) => (
                  <div key={wish.id} className="bg-stone-50 p-5 rounded-2xl border border-stone-100 hover:border-primary/20 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-stone-800 text-lg tracking-wide">{wish.name}</h4>
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold ${wish.status === 'hadir' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                        {wish.status === 'hadir' ? <><Check size={12} /> Hadir</> : <><X size={12} /> Tidak Hadir</>}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mb-3 uppercase tracking-wider">{new Date(wish.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                    <p className="text-sm text-stone-600 leading-relaxed font-light">{wish.message}</p>
                  </div>
                )) : (
                  <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl">
                     <p className="text-sm text-stone-500 mb-2">Belum ada ucapan.</p>
                     <p className="text-xs text-primary">Jadilah yang pertama memberikan doa restu!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="bg-primary text-white text-center py-16 px-6 font-playfair relative z-10 rounded-t-[3rem] overflow-hidden mt-8 shadow-[0_-10px_30px_rgba(6,78,59,0.1)]">
          <p className="text-accent text-5xl font-great-vibes mb-4 drop-shadow-md">{liveConfig.brideName.split(' ')[0]} & {liveConfig.groomName.split(' ')[0]}</p>
          <p className="text-xs text-white/50 tracking-[0.3em] uppercase font-light">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
        </footer>

        {/* Music Player */}
        <button 
          className={`fixed bottom-6 right-6 w-16 h-16 bg-white backdrop-blur-xl rounded-full flex items-center justify-center text-primary shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-stone-100 z-40 transition-all hover:scale-110 hover:border-primary/30 ${isPlaying ? 'animate-[spin_4s_linear_infinite] shadow-[0_0_30px_rgba(212,175,55,0.4)]' : ''}`}
          onClick={toggleMusic}
        >
          <Disc3 size={28} className={isPlaying ? 'text-primary' : 'text-stone-300'} />
          <div className="absolute w-4 h-4 bg-primary rounded-full border-[3px] border-white"></div>
        </button>
        <audio ref={audioRef} id="bg-music" loop src={liveConfig.musicUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} />

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightboxImg(null)}
          >
            <button className="absolute top-8 right-8 text-stone-400 hover:text-primary transition-colors hover:rotate-90 duration-300" onClick={() => setLightboxImg(null)}>
              <XCircle size={40} strokeWidth={1.5} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, y: 20, rotate: -5 }} animate={{ scale: 1, y: 0, rotate: 0 }} exit={{ scale: 0.9, y: 20, rotate: 5 }} transition={{ type: 'spring', damping: 20 }}
              src={lightboxImg} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] object-contain border border-stone-200" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

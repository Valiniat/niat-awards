import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, Calendar, Sparkles, ChevronDown, User, Phone, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const DEADLINE = new Date("2026-04-30T23:59:59");

const useCountdown = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, DEADLINE.getTime() - now.getTime());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
};

const CountdownBox = ({ value, label, delay }: { value: number; label: string; delay: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
    className="flex flex-col items-center">
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
      <div className="absolute inset-0 rounded-xl bg-secondary/30 blur-md" />
      <div className="relative w-full h-full rounded-xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm shadow-lg">
        <AnimatePresence mode="popLayout">
          <motion.span key={value} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }} className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
    <span className="text-[9px] sm:text-[10px] text-white/60 mt-2 uppercase tracking-widest font-medium">{label}</span>
  </motion.div>
);

const Particle = ({ delay }: { delay: number }) => (
  <motion.div className="absolute w-1 h-1 rounded-full bg-secondary/60"
    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
    animate={{ y: [-20, -60, -20], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
    transition={{ duration: 3 + Math.random() * 2, delay, repeat: Infinity, ease: "easeInOut" }} />
);

// ── Quick Nominate Card ──
const QuickNominateCard = () => {
  const { isAuthenticated, sendOtp, verifyOtp, setUserName } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in just show CTA
  if (isAuthenticated) {
    return (
      <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-7 text-center relative overflow-hidden shadow-2xl shadow-black/40">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary/0 via-secondary to-secondary/0" />
        <img src="/niat-logo.png" alt="NIAT" className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-xl" />
        <h3 className="font-heading text-xl font-bold text-white mb-2">You're logged in!</h3>
        <p className="text-sm text-white/70 mb-5">Ready to nominate your favourite teacher?</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/nominate")}
          className="w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white font-semibold flex items-center justify-center gap-2">
          <Star className="w-4 h-4" /> Nominate Now <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    );
  }

  const handleSend = async () => {
    if (!name.trim()) { toast({ title: "Please enter your name", variant: "destructive" }); return; }
    if (phone.replace(/\D/g, "").length < 10) { toast({ title: "Enter a valid 10-digit number", variant: "destructive" }); return; }
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (result.success) { setStep("otp"); toast({ title: "OTP sent! Check your SMS." }); }
    else toast({ title: result.error || "Failed to send OTP", variant: "destructive" });
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    const ok = await verifyOtp(otp);
    setLoading(false);
    if (ok) { setUserName(name.trim()); navigate("/nominate"); }
    else { toast({ title: "Invalid OTP", variant: "destructive" }); setOtp(""); }
  };

  return (
    <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-black/40">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary/0 via-secondary to-secondary/0" />
      {/* Shimmer */}
      <motion.div animate={{ x: [-200, 400] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "linear" }}
        className="absolute inset-0 w-32 bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-12 pointer-events-none" />

      <div className="p-6 sm:p-7">
        {/* Logo + title */}
        <div className="flex items-center gap-3 mb-5">
          <img src="/niat-logo.png" alt="NIAT" className="w-10 h-10 object-contain drop-shadow" />
          <div>
            <p className="font-heading font-bold text-white text-sm leading-tight">Nominate Your Teacher</p>
            <p className="text-[11px] text-white/50">Takes less than 3 minutes</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div key="form" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-3">
              {/* Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                  className="pl-9 bg-white/8 border-white/20 text-white placeholder:text-white/35 h-11 focus:border-secondary/60 focus:bg-white/12 transition-all" />
              </div>
              {/* Phone */}
              <div className="flex gap-2">
                <div className="flex items-center px-3 rounded-lg bg-white/8 border border-white/20 text-white/70 text-sm font-medium flex-shrink-0">+91</div>
                <Input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number" type="tel"
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  className="bg-white/8 border-white/20 text-white placeholder:text-white/35 h-11 focus:border-secondary/60 focus:bg-white/12 transition-all" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSend} disabled={loading}
                className="w-full h-11 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Star className="w-4 h-4" /> Get OTP & Nominate</>}
              </motion.button>
              <p className="text-[10px] text-white/35 text-center">Free · No spam · OTP verification</p>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
              <div className="bg-white/8 border border-white/15 rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-xs text-white/70">OTP sent to <span className="text-white font-semibold">+91 {phone}</span></p>
                <button onClick={() => setStep("form")} className="ml-auto text-[10px] text-secondary underline">Change</button>
              </div>
              <Input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit OTP" type="tel" maxLength={6}
                onKeyDown={e => e.key === "Enter" && handleVerify()}
                className="bg-white/8 border-white/20 text-white placeholder:text-white/35 h-11 text-center text-lg tracking-[0.4em] font-bold focus:border-secondary/60 transition-all" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={loading || otp.length < 6}
                className="w-full h-11 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Verify & Nominate</>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const HeroSection = () => {
  const countdown = useCountdown();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <section ref={sectionRef} className="relative min-h-screen flex items-center bg-gradient-dark overflow-hidden pt-[68px]">
        {/* Parallax bg glows */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-10 left-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
          <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/80 rounded-full blur-[140px]" />
          <motion.div animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px]" />
        </motion.div>
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => <Particle key={i} delay={i * 0.4} />)}
        </div>

        <motion.div style={{ opacity }} className="container relative z-10 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left ── */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-semibold text-secondary tracking-wide uppercase">NIAT Presents · 2026</span>
              </motion.div>

              <div className="overflow-hidden mb-4">
                <motion.h1 initial={{ y: 80 }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05]">
                  India's{" "}
                  <span className="relative inline-block">
                    <span className="text-secondary">Future-Ready</span>
                    <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.8 }}
                      style={{ originX: 0 }} className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary to-secondary/30 rounded-full" />
                  </span>
                  <br />Educator Awards
                </motion.h1>
              </div>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
                className="text-base sm:text-lg text-white/75 max-w-lg mb-1 leading-relaxed">
                For the teachers who build futures, not just scores.
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="text-sm sm:text-base text-white/50 max-w-lg mb-10">
                Nominate the educator who changed your life.
              </motion.p>

              {/* Timeline pills */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                className="flex flex-wrap gap-2 mb-8">
                {[
                  { label: "Nominations", date: "Till Apr 30", color: "text-secondary border-secondary/30 bg-secondary/10" },
                  { label: "Voting Phase", date: "May 1–31", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
                  { label: "Winners", date: "June 1st Week", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
                ].map(t => (
                  <span key={t.label} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border ${t.color}`}>
                    <span>{t.label}</span>
                    <span className="opacity-60">·</span>
                    <span className="opacity-80">{t.date}</span>
                  </span>
                ))}
              </motion.div>
            </div>

            {/* ── Right ── */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-5">

              {/* Countdown */}
              <div className="w-full">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className="text-[11px] uppercase tracking-[0.25em] text-secondary font-bold mb-4 text-center">
                  Nominations Close In
                </motion.p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <CountdownBox value={countdown.days} label="Days" delay={0.7} />
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.9 }}
                    className="text-3xl text-white font-light mb-5">:</motion.span>
                  <CountdownBox value={countdown.hours} label="Hours" delay={0.8} />
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1 }}
                    className="text-3xl text-white font-light mb-5">:</motion.span>
                  <CountdownBox value={countdown.minutes} label="Mins" delay={0.9} />
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1.1 }}
                    className="text-3xl text-white font-light mb-5">:</motion.span>
                  <CountdownBox value={countdown.seconds} label="Secs" delay={1.0} />
                </div>
              </div>

              {/* Quick Nominate Card */}
              <div className="w-full max-w-sm">
                <QuickNominateCard />
              </div>

              {/* Deadline badge */}
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-secondary/15 border border-secondary/30 cursor-default">
                <Calendar className="w-4 h-4 text-secondary" />
                <span className="text-sm text-white font-semibold">Nominations close 30 April 2026</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Scroll</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4 text-white/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

export default HeroSection;

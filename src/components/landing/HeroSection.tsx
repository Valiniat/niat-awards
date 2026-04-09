import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, Calendar, Sparkles, ChevronDown, User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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

// ── Quick Nominate Card ── World-class redesign ──
const FloatingInput = ({ icon: Icon, label, value, onChange, onKeyDown, placeholder, type = "text", inputMode, maxLength, autoFocus, prefix, disabled }: any) => {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div className="relative">
      <div className={`relative flex items-center rounded-xl border transition-all duration-200 overflow-hidden ${
        focused
          ? "border-secondary/80 bg-white/12 shadow-[0_0_0_3px_rgba(217,119,6,0.15)]"
          : filled
          ? "border-white/30 bg-white/8"
          : "border-white/15 bg-white/5"
      }`}>
        {prefix && (
          <div className={`px-3.5 border-r h-full flex items-center transition-colors ${focused ? "border-white/20 text-white/80" : "border-white/10 text-white/50"}`}>
            <span className="text-[13px] font-bold">{prefix}</span>
          </div>
        )}
        {Icon && !prefix && (
          <div className="pl-4 flex-shrink-0">
            <Icon className={`w-[15px] h-[15px] transition-colors ${focused || filled ? "text-secondary" : "text-white/35"}`} />
          </div>
        )}
        <div className="relative flex-1">
          <motion.label
            animate={{ y: focused || filled ? -9 : 0, scale: focused || filled ? 0.72 : 1, x: Icon && !prefix ? 8 : prefix ? 12 : 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-0 top-1/2 -translate-y-1/2 origin-left pointer-events-none font-medium transition-colors ${
              focused ? "text-secondary" : "text-white/45"
            } ${focused || filled ? "text-[11px]" : "text-[13px]"}`}
            style={{ paddingLeft: Icon && !prefix ? 8 : prefix ? 12 : 12 }}
          >
            {label}
          </motion.label>
          <input
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            type={type}
            inputMode={inputMode}
            maxLength={maxLength}
            autoFocus={autoFocus}
            disabled={disabled}
            className={`w-full h-[52px] bg-transparent text-white text-[14px] font-medium focus:outline-none transition-all ${
              Icon && !prefix ? "pl-2 pr-4" : prefix ? "px-3" : "px-3"
            } ${filled || focused ? "pt-3" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};

const QuickNominateCard = () => {
  const { isAuthenticated, user, sendOtp, verifyOtp, setUserName } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in — personalised greeting card
  if (isAuthenticated) {
    const initials = (user?.name || "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
    return (
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-sm relative"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 rounded-2xl bg-secondary/10 blur-2xl scale-95" />
        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-b from-white/12 to-white/6 backdrop-blur-2xl shadow-2xl shadow-black/50">
          {/* Gold top bar */}
          <div className="h-[3px] bg-gradient-to-r from-secondary/20 via-secondary to-secondary/20" />
          {/* Shimmer */}
          <motion.div animate={{ x: [-300, 500] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4 }}
            className="absolute inset-0 w-40 bg-gradient-to-r from-transparent via-white/6 to-transparent skew-x-12 pointer-events-none" />

          <div className="p-7 text-center">
            {/* Avatar */}
            <div className="relative inline-flex mb-4">
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] flex items-center justify-center border-2 border-secondary/40 shadow-lg shadow-secondary/20">
                <span className="font-heading font-bold text-2xl text-white">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-[#0f0f0f]">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            </div>
            <h3 className="font-heading text-[22px] font-bold text-white mb-1.5">
              Hey {user?.name?.split(" ")[0] || "there"}! 👋
            </h3>
            <p className="text-[13px] text-white/60 leading-relaxed mb-6">
              Ready to nominate the teacher<br />who changed your life?
            </p>
            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(107,18,18,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/nominate")}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9B2020] to-[#7A1515] text-white font-bold text-[15px] flex items-center justify-center gap-2.5 shadow-lg shadow-primary/30 relative overflow-hidden"
            >
              <motion.div animate={{ x: [-200, 400] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />
              <Star className="w-4 h-4 fill-white" /> Nominate Now
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
            <p className="text-[11px] text-white/30 mt-3">+91 {user?.phone}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleSend = async () => {
    if (!name.trim()) { toast({ title: "Please enter your name", variant: "destructive" }); return; }
    if (phone.replace(/\D/g, "").length < 10) { toast({ title: "Enter a valid 10-digit number", variant: "destructive" }); return; }
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (result.success) { setStep("otp"); }
    else { toast({ title: result.error || "Failed to send OTP", variant: "destructive" }); }
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    const ok = await verifyOtp(otp);
    if (ok) {
      if (name.trim()) setUserName(name.trim());
      navigate("/nominate");
    } else {
      toast({ title: "Invalid OTP. Please try again.", variant: "destructive" });
      setOtp("");
    }
    setLoading(false);
  };

  return (
    <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="w-full max-w-sm relative">
      {/* Card glow */}
      <div className="absolute inset-0 rounded-2xl bg-secondary/8 blur-2xl scale-95" />
      <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-b from-white/12 to-white/6 backdrop-blur-2xl shadow-2xl shadow-black/50">
        {/* Gold top accent */}
        <div className="h-[3px] bg-gradient-to-r from-secondary/20 via-secondary to-secondary/20" />
        {/* Shimmer */}
        <motion.div animate={{ x: [-300, 500] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5 }}
          className="absolute inset-0 w-40 bg-gradient-to-r from-transparent via-white/6 to-transparent skew-x-12 pointer-events-none" />

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-shrink-0">
              <img src="/niat-logo.png" alt="NIAT" className="w-11 h-11 object-contain drop-shadow-lg" />
            </div>
            <div>
              <p className="font-heading font-bold text-white text-[16px] leading-tight tracking-tight">Nominate Your Teacher</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[11px] text-white/50">Free · Takes 3 mins · Open across India</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }} className="space-y-3">

                <FloatingInput
                  icon={User}
                  label="Your Full Name"
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                  onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
                  autoFocus
                />
                <FloatingInput
                  prefix="+91"
                  label="Mobile Number"
                  value={phone}
                  onChange={(e: any) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                />

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(107,18,18,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full h-[52px] rounded-xl bg-gradient-to-r from-[#9B2020] to-[#7A1515] text-white font-bold text-[15px] flex items-center justify-center gap-2.5 shadow-lg shadow-primary/30 disabled:opacity-60 relative overflow-hidden mt-1"
                >
                  <motion.div animate={{ x: [-200, 400] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                    className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Star className="w-4 h-4 fill-white" /> Send OTP &amp; Nominate</>}
                </motion.button>

                <p className="text-center text-[11px] text-white/30 pt-0.5">
                  By continuing, you agree to our <span className="text-white/50 underline cursor-pointer">Terms</span>
                </p>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }} className="space-y-4">

                {/* Personalized OTP banner */}
                <div className="rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] flex items-center justify-center border border-white/10 flex-shrink-0">
                    <span className="text-[11px] font-bold text-white">
                      {name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white">Hey {name.split(" ")[0]}!</p>
                    <p className="text-[11px] text-white/50 truncate">OTP sent to +91 {phone}</p>
                  </div>
                  <button onClick={() => { setStep("form"); setOtp(""); }}
                    className="text-[11px] font-semibold text-secondary hover:text-secondary/80 transition-colors flex-shrink-0">
                    Edit
                  </button>
                </div>

                {/* OTP boxes */}
                <div>
                  <p className="text-[11px] font-semibold text-white/55 mb-2.5 uppercase tracking-wider">Enter 6-digit OTP</p>
                  <FloatingInput
                    label="OTP Code"
                    value={otp}
                    onChange={(e: any) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e: any) => e.key === "Enter" && handleVerify()}
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleVerify}
                  disabled={loading || otp.length < 6}
                  className="w-full h-[52px] rounded-xl bg-gradient-to-r from-[#9B2020] to-[#7A1515] text-white font-bold text-[15px] flex items-center justify-center gap-2.5 shadow-lg shadow-primary/30 disabled:opacity-50 relative overflow-hidden"
                >
                  <motion.div animate={{ x: [-200, 400] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                    className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Verify &amp; Continue</>}
                </motion.button>

                <button onClick={handleSend}
                  className="w-full text-center text-[12px] text-white/35 hover:text-secondary transition-colors">
                  Didn't receive OTP? Resend
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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

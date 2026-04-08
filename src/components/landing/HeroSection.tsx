import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, Calendar, Sparkles, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginDialog from "@/components/auth/LoginDialog";

const DEADLINE = new Date("2026-05-31T23:59:59");

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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex flex-col items-center"
  >
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
      <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md" />
      <div className="relative w-full h-full rounded-xl bg-white/5 border border-white/15 flex items-center justify-center backdrop-blur-sm">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
    <span className="text-[9px] sm:text-[10px] text-white/50 mt-2 uppercase tracking-widest font-medium">{label}</span>
  </motion.div>
);

// Particle component
const Particle = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-secondary/60"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    animate={{
      y: [-20, -60, -20],
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
    }}
    transition={{
      duration: 3 + Math.random() * 2,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const HeroSection = () => {
  const countdown = useCountdown();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<"student" | "teacher" | undefined>();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleNominate = () => {
    if (isAuthenticated) navigate("/nominate");
    else { setLoginRole("student"); setLoginOpen(true); }
  };
  const handleApply = () => {
    if (isAuthenticated) navigate("/nominate?type=self");
    else { setLoginRole("teacher"); setLoginOpen(true); }
  };

  const stats = [
    { num: "12,400+", label: "Nominations" },
    { num: "28", label: "States" },
    { num: "4", label: "Categories" },
  ];

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

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => <Particle key={i} delay={i * 0.4} />)}
        </div>

        <motion.div style={{ opacity }} className="container relative z-10 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left Column ── */}
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
                      style={{ originX: 0 }}
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary to-secondary/30 rounded-full" />
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

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-3 mb-12">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Button variant="hero" size="lg" onClick={handleNominate}
                    className="text-sm sm:text-base px-7 py-6 rounded-xl w-full sm:w-auto gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
                    <Star className="w-4 h-4" />
                    Nominate a Teacher
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Button variant="hero-outline" size="lg" onClick={handleApply}
                    className="text-sm sm:text-base px-7 py-6 rounded-xl w-full sm:w-auto">
                    Apply as Teacher
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="flex items-center gap-0 divide-x divide-white/10">
                {stats.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.1 }} className="px-5 first:pl-0">
                    <div className="text-xl sm:text-2xl font-bold text-white">{s.num}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50 mt-0.5">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── Right Column ── */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6">

              {/* Countdown */}
              <div className="w-full text-center">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-semibold mb-4">
                  Nominations Close In
                </motion.p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <CountdownBox value={countdown.days} label="Days" delay={0.7} />
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.9 }}
                    className="text-3xl text-white font-light mb-5">:</motion.span>
                  <CountdownBox value={countdown.hours} label="Hours" delay={0.8} />
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
                    className="text-3xl text-white font-light mb-5">:</motion.span>
                  <CountdownBox value={countdown.minutes} label="Mins" delay={0.9} />
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.1 }}
                    className="text-3xl text-white font-light mb-5">:</motion.span>
                  <CountdownBox value={countdown.seconds} label="Secs" delay={1.0} />
                </div>
              </div>

              {/* Recognition card */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.02 }}
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-7 text-center relative overflow-hidden cursor-pointer"
              >
                {/* Card shimmer effect */}
                <motion.div
                  animate={{ x: [-200, 400] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
                  className="absolute inset-0 w-32 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                />
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <img src="/niat-logo.png" alt="NIAT" className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto mb-5 drop-shadow-xl" />
                </motion.div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">National Recognition</h3>
                <p className="text-sm text-white/65 mb-5 leading-relaxed">
                  Winners receive national recognition, a certificate of excellence, and a ₹50,000 prize.
                </p>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + i * 0.1, type: "spring" }}>
                      <Star className="w-5 h-5 fill-secondary text-secondary" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-white/40">Rated 4.9/5 by past nominees</p>
              </motion.div>

              {/* Deadline badge */}
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 cursor-default">
                <Calendar className="w-4 h-4 text-secondary" />
                <span className="text-sm text-white/65 font-medium">Nominations open until 31 May 2026</span>
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

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} defaultRole={loginRole} />
    </>
  );
};

export default HeroSection;

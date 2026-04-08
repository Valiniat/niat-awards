import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Award, Star, ArrowRight, Calendar } from "lucide-react";
import { useEffect } from "react";
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
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
};

const CountdownBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
      <span className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[9px] sm:text-[10px] text-primary-foreground/70 mt-1.5 uppercase tracking-wider">{label}</span>
  </div>
);

const HeroSection = () => {
  const countdown = useCountdown();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<"student" | "teacher" | undefined>();

  const handleNominate = () => {
    if (isAuthenticated) navigate("/nominate");
    else { setLoginRole("student"); setLoginOpen(true); }
  };

  const handleApply = () => {
    if (isAuthenticated) navigate("/nominate?type=self");
    else { setLoginRole("teacher"); setLoginOpen(true); }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center bg-gradient-dark overflow-hidden pt-[105px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-4 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 py-10 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left Column */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70 font-medium mb-3 sm:mb-4">
                NIAT Presents
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground leading-[1.1] mb-4 sm:mb-6">
                India's{" "}
                <span className="text-secondary">Future-Ready</span>
                <br />Educator Awards
              </h1>
              <p className="text-base sm:text-lg text-primary-foreground/80 max-w-lg mb-2 leading-relaxed">
                For the teachers who build futures, not just scores.
              </p>
              <p className="text-sm sm:text-base text-primary-foreground/60 max-w-lg mb-8 sm:mb-10">
                Nominate the educator who changed your life.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <Button variant="hero" size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-lg w-full sm:w-auto gap-2" onClick={handleNominate}>
                  <Star className="w-4 h-4" />
                  Nominate a Teacher
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="hero-outline" size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-lg w-full sm:w-auto" onClick={handleApply}>
                  Apply as Teacher
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 sm:gap-8 text-primary-foreground flex-wrap">
                <div className="border-r border-primary-foreground/20 pr-4 sm:pr-8">
                  <div className="text-xl sm:text-2xl font-bold">12,400+</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider text-primary-foreground/70">Nominations</div>
                </div>
                <div className="border-r border-primary-foreground/20 pr-4 sm:pr-8">
                  <div className="text-xl sm:text-2xl font-bold">28 States</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider text-primary-foreground/70">Covered</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold">4 Categories</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider text-primary-foreground/70">Awards</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col items-center gap-5 sm:gap-6"
            >
              {/* Countdown */}
              <div className="text-center w-full">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary-foreground/70 font-semibold mb-3 sm:mb-4">
                  Nominations Close In
                </p>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <CountdownBox value={countdown.days} label="Days" />
                  <span className="text-xl sm:text-2xl text-primary-foreground/30 font-light mt-[-18px]">:</span>
                  <CountdownBox value={countdown.hours} label="Hours" />
                  <span className="text-xl sm:text-2xl text-primary-foreground/30 font-light mt-[-18px]">:</span>
                  <CountdownBox value={countdown.minutes} label="Mins" />
                  <span className="text-xl sm:text-2xl text-primary-foreground/30 font-light mt-[-18px]">:</span>
                  <CountdownBox value={countdown.seconds} label="Secs" />
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-xs sm:max-w-sm rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-sm p-6 sm:p-8 text-center"
              >
                {/* Logo badge — enlarged and prominent */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] ring-2 ring-white/10 shadow-lg shadow-[#8B1A1A]/30 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <img src="/niat-logo.png" alt="NIAT" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-primary-foreground mb-2">
                  National Recognition
                </h3>
                <p className="text-xs sm:text-sm text-primary-foreground/75 mb-4 sm:mb-5 leading-relaxed">
                  Winners receive national recognition, a certificate of excellence, and a ₹50,000 prize.
                </p>
                <div className="flex items-center justify-center gap-1 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-xs text-primary-foreground/60">Rated 4.9/5 by past nominees</p>
              </motion.div>

              {/* Deadline badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary-foreground/5 border border-primary-foreground/10">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-primary-foreground/70 font-medium">
                  Nominations open until 31 May 2026
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} defaultRole={loginRole} />
    </>
  );
};

export default HeroSection;

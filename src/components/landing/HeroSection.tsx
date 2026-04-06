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
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
      <span className="font-heading text-2xl sm:text-3xl font-bold text-primary-foreground">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[10px] sm:text-xs text-primary-foreground/50 mt-1.5 uppercase tracking-wider">{label}</span>
  </div>
);

const HeroSection = () => {
  const countdown = useCountdown();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<"student" | "teacher" | undefined>();

  const handleNominate = () => {
    if (isAuthenticated) {
      navigate("/nominate");
    } else {
      setLoginRole("student");
      setLoginOpen(true);
    }
  };

  const handleApply = () => {
    if (isAuthenticated) {
      navigate("/nominate?type=self");
    } else {
      setLoginRole("teacher");
      setLoginOpen(true);
    }
  };

  return (
    <>
      <section className="relative min-h-[85vh] flex items-center bg-gradient-dark overflow-hidden pt-[105px]">
        {/* Decorative glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/50 font-medium mb-4">
                NIAT Presents
              </p>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] mb-6">
                India's{" "}
                <span className="text-secondary">Future-Ready</span>
                <br />
                Educator Awards
              </h1>

              <p className="text-lg text-primary-foreground/60 max-w-lg mb-2 leading-relaxed">
                For the teachers who build futures, not just scores.
              </p>
              <p className="text-base text-primary-foreground/40 max-w-lg mb-10">
                Nominate the educator who changed your life.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  variant="hero"
                  size="lg"
                  className="text-base px-8 py-6 rounded-lg w-full sm:w-auto gap-2"
                  onClick={handleNominate}
                >
                  <Star className="w-4 h-4" />
                  Nominate a Teacher
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="hero-outline"
                  size="lg"
                  className="text-base px-8 py-6 rounded-lg w-full sm:w-auto"
                  onClick={handleApply}
                >
                  Apply as Educator
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 sm:gap-8 text-primary-foreground">
                <div className="border-r border-primary-foreground/20 pr-6 sm:pr-8">
                  <div className="text-2xl font-bold">12,400+</div>
                  <div className="text-xs uppercase tracking-wider text-primary-foreground/50">Nominations</div>
                </div>
                <div className="border-r border-primary-foreground/20 pr-6 sm:pr-8">
                  <div className="text-2xl font-bold">28 States</div>
                  <div className="text-xs uppercase tracking-wider text-primary-foreground/50">Covered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">4 Categories</div>
                  <div className="text-xs uppercase tracking-wider text-primary-foreground/50">Awards</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Countdown Timer */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/50 font-semibold mb-4">
                  Nominations Close In
                </p>
                <div className="flex items-center gap-2">
                  <CountdownBox value={countdown.days} label="Days" />
                  <span className="text-2xl text-primary-foreground/30 font-light mt-[-18px]">:</span>
                  <CountdownBox value={countdown.hours} label="Hours" />
                  <span className="text-2xl text-primary-foreground/30 font-light mt-[-18px]">:</span>
                  <CountdownBox value={countdown.minutes} label="Minutes" />
                  <span className="text-2xl text-primary-foreground/30 font-light mt-[-18px]">:</span>
                  <CountdownBox value={countdown.seconds} label="Seconds" />
                </div>
              </div>

              {/* National Recognition Card */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-sm p-8 text-center"
              >
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-bold text-primary-foreground mb-2">
                  National Recognition
                </h3>
                <p className="text-sm text-primary-foreground/50 mb-4 leading-relaxed">
                  Winners receive national recognition, a certificate of excellence, and a ₹50,000 prize.
                </p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-xs text-primary-foreground/40">Rated 4.9/5 by past nominees</p>
              </motion.div>

              {/* Deadline badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-foreground/5 border border-primary-foreground/10">
                <Calendar className="w-4 h-4 text-secondary" />
                <span className="text-sm text-primary-foreground/70 font-medium">
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

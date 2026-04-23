import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/auth/LoginDialog";
import StudentNominationForm from "@/components/nomination/StudentNominationForm";
import TeacherSelfNominationForm from "@/components/nomination/TeacherSelfNominationForm";

type NomType = null | "student" | "self";

const NominatePage = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  // Open login immediately if not authenticated — skip the intermediate screen
  const [loginOpen, setLoginOpen] = useState(!isAuthenticated);

  const paramType = searchParams.get("type");
  const [nomType, setNomType] = useState<NomType>(
    paramType === "self" ? "self" : paramType === "student" ? "student" : null
  );

  // Sync URL param changes
  useEffect(() => {
    if (paramType === "self") setNomType("self");
    else if (paramType === "student") setNomType("student");
  }, [paramType]);

  // Keep login open when not authenticated; close when auth succeeds
  useEffect(() => {
    if (!isAuthenticated) setLoginOpen(true);
    else setLoginOpen(false);
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background" id="main-content" role="main">
      <Navbar />
      <div className="pt-[56px]">
        <div className="container max-w-2xl px-4 py-8 sm:py-14">

          <AnimatePresence mode="wait">

            {/* Not logged in */}
            {!isAuthenticated && (
              <motion.div key="not-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-24">
                <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2 mb-6">
                  <Star className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs font-semibold text-secondary uppercase tracking-widest">NIAT Awards 2026</span>
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-3">Verify your number to continue</h1>
                <p className="text-foreground/55 text-sm mb-8">Quick OTP verification — takes 30 seconds</p>
                <button id="btn-nominate-verify" onClick={() => setLoginOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg,#9B2020,#7A1515)" }}>
                  Verify &amp; Nominate <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Logged in — pick role */}
            {isAuthenticated && !nomType && (
              <motion.div key="pick" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-5">
                    <Star className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-semibold text-secondary uppercase tracking-widest">NIAT Awards 2026</span>
                  </div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">Who are you nominating?</h1>
                  <p className="text-foreground/55 text-sm sm:text-base">Choose your path — both take less than 3 minutes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      type: "student" as const,
                      emoji: "🎓",
                      badge: "For Students & Parents",
                      badgeStyle: { background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" },
                      title: "Nominate My Teacher",
                      desc: "Recognize the educator who changed your life.",
                      arrowColor: "#f59e0b",
                      cardStyle: { borderColor: "rgba(245,158,11,0.2)" },
                      hoverBorder: "hover:border-amber-400/50",
                    },
                    {
                      type: "self" as const,
                      emoji: "👩‍🏫",
                      badge: "For Teachers",
                      badgeStyle: { background: "rgba(107,18,18,0.12)", color: "#9B2020", border: "1px solid rgba(107,18,18,0.25)" },
                      title: "Apply as a Teacher",
                      desc: "Self-nominate and showcase your teaching impact.",
                      arrowColor: "#9B2020",
                      cardStyle: { borderColor: "rgba(107,18,18,0.2)" },
                      hoverBorder: "hover:border-primary/50",
                    },
                  ].map((opt, i) => (
                    <motion.button
                      key={opt.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNomType(opt.type)}
                      className={`text-left p-6 rounded-2xl border bg-card transition-all duration-200 ${opt.hoverBorder}`}
                      style={opt.cardStyle}
                    >
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4"
                        style={opt.badgeStyle}>
                        {opt.badge}
                      </span>
                      <div className="text-4xl mb-3">{opt.emoji}</div>
                      <h2 className="font-heading text-xl font-bold text-foreground mb-2">{opt.title}</h2>
                      <p className="text-sm text-foreground/60 leading-relaxed mb-5">{opt.desc}</p>
                      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: opt.arrowColor }}>
                        Get started <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Logged in — show form */}
            {isAuthenticated && nomType && (
              <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <button id="btn-nominate-back" onClick={() => setNomType(null)}
                  className="flex items-center gap-1 text-foreground/55 hover:text-foreground text-sm mb-5 transition-colors min-h-[44px]">
                  <ChevronLeft className="w-4 h-4" /> Change selection
                </button>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                  style={nomType === "student"
                    ? { background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }
                    : { background: "rgba(107,18,18,0.1)", color: "#9B2020", border: "1px solid rgba(107,18,18,0.2)" }
                  }>
                  {nomType === "student" ? "🎓 Nominating a Teacher" : "👩‍🏫 Teacher Self-Nomination"}
                </div>

                {nomType === "student" ? <StudentNominationForm /> : <TeacherSelfNominationForm />}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      <Footer />

      <LoginDialog
        open={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open);
        }}
        defaultRole={nomType === "self" ? "teacher" : "student"}
      />
    </div>
  );
};

export default NominatePage;

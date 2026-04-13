import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Users, UserCheck, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/auth/LoginDialog";
import StudentNominationForm from "@/components/nomination/StudentNominationForm";
import TeacherSelfNominationForm from "@/components/nomination/TeacherSelfNominationForm";

type NomType = null | "student" | "self";
type Step = "pick" | "auth" | "form";

const NominatePage = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const paramType = searchParams.get("type");

  const [nomType, setNomType] = useState<NomType>(
    paramType === "self" ? "self" : paramType === "student" ? "student" : null
  );

  // Determine current step
  const step: Step = !nomType ? "pick" : !isAuthenticated ? "auth" : "form";

  // When type comes from URL param, set it immediately
  useEffect(() => {
    if (paramType === "self") setNomType("self");
    else if (paramType === "student") setNomType("student");
  }, [paramType]);

  // Open login dialog when type is selected but user not logged in
  useEffect(() => {
    if (nomType && !isAuthenticated) setLoginOpen(true);
  }, [nomType, isAuthenticated]);

  // Close login dialog when user logs in
  useEffect(() => {
    if (isAuthenticated) setLoginOpen(false);
  }, [isAuthenticated]);

  const handlePickType = (type: NomType) => {
    setNomType(type);
    if (!isAuthenticated) setLoginOpen(true);
  };

  const options = [
    {
      type: "student" as const,
      icon: Users,
      emoji: "🎓",
      title: "Nominate My Teacher",
      subtitle: "I'm a student or parent",
      desc: "Recognize the educator who changed your life. Takes 3 minutes.",
      color: "from-amber-500/10 to-amber-500/5",
      border: "border-amber-500/20 hover:border-amber-500/50",
      iconColor: "text-amber-400",
      badgeBg: "bg-amber-500/10 text-amber-400",
      badge: "For Students & Parents",
    },
    {
      type: "self" as const,
      icon: UserCheck,
      emoji: "👩‍🏫",
      title: "Apply as a Teacher",
      subtitle: "I'm an educator",
      desc: "Self-nominate and showcase your teaching impact and innovations.",
      color: "from-primary/10 to-primary/5",
      border: "border-primary/20 hover:border-primary/50",
      iconColor: "text-primary",
      badgeBg: "bg-primary/10 text-primary",
      badge: "For Teachers",
    },
  ];

  return (
    <div className="min-h-screen bg-background" id="main-content" role="main">
      <Navbar />
      <div className="pt-[56px]">
        <div className="container max-w-2xl px-4 py-8 sm:py-14">

          <AnimatePresence mode="wait">

            {/* STEP 1 — Pick role */}
            {step === "pick" && (
              <motion.div key="pick" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-5">
                    <Star className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-semibold text-secondary uppercase tracking-widest">NIAT Awards 2026</span>
                  </div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Who are you nominating?
                  </h1>
                  <p className="text-foreground/60 text-sm sm:text-base max-w-md mx-auto">
                    Choose your path below — both take less than 3 minutes and are completely free.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {options.map((opt, i) => (
                    <motion.button
                      key={opt.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePickType(opt.type)}
                      className={`relative text-left p-6 rounded-2xl border bg-gradient-to-b ${opt.color} ${opt.border} transition-all duration-200 group overflow-hidden`}
                    >
                      {/* Badge */}
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${opt.badgeBg}`}>
                        {opt.badge}
                      </span>

                      {/* Emoji */}
                      <div className="text-4xl mb-3">{opt.emoji}</div>

                      <h2 className="font-heading text-xl font-bold text-foreground mb-1">{opt.title}</h2>
                      <p className="text-sm text-foreground/50 mb-1">{opt.subtitle}</p>
                      <p className="text-sm text-foreground/65 leading-relaxed mb-5">{opt.desc}</p>

                      <div className={`flex items-center gap-2 text-sm font-semibold ${opt.iconColor}`}>
                        Get started
                        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Login required message (shown while dialog is open) */}
            {step === "auth" && (
              <motion.div key="auth" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center py-20">
                <button onClick={() => setNomType(null)}
                  className="flex items-center gap-1 text-foreground/50 hover:text-foreground text-sm mb-10 mx-auto transition-colors min-h-[44px]">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <p className="text-foreground/50 text-sm">Please verify your phone number to continue.</p>
              </motion.div>
            )}

            {/* STEP 3 — Form */}
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <button onClick={() => setNomType(null)}
                  className="flex items-center gap-1 text-foreground/60 hover:text-foreground text-sm mb-6 transition-colors min-h-[44px]">
                  <ChevronLeft className="w-4 h-4" /> Change selection
                </button>

                {/* Selected type label */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${
                  nomType === "student" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-primary/10 text-primary border border-primary/20"
                }`}>
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
          if (!open && !isAuthenticated) setNomType(null); // go back if they close without logging in
        }}
        defaultRole={nomType === "self" ? "teacher" : "student"}
      />
    </div>
  );
};

export default NominatePage;

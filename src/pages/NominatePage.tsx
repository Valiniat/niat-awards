import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { ChevronLeft, Users, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/auth/LoginDialog";
import StudentNominationForm from "@/components/nomination/StudentNominationForm";
import TeacherSelfNominationForm from "@/components/nomination/TeacherSelfNominationForm";

type NomType = null | "student" | "self";

const NominatePage = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const paramType = searchParams.get("type");
  const initialType: NomType = paramType === "self" ? "self" : paramType === "student" ? "student" : null;
  const [nomType, setNomType] = useState<NomType>(initialType);

  useEffect(() => {
    if (paramType === "self") setNomType("self");
    else if (paramType === "student") setNomType("student");
  }, [paramType]);

  useEffect(() => {
    if (!isAuthenticated) setLoginOpen(true);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user && !nomType) {
      if (user.role === "teacher") setNomType("self");
      else setNomType("student");
    }
  }, [isAuthenticated, user, nomType]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[56px]">
        <div className="container max-w-2xl px-4 py-8 sm:py-12">
          {isAuthenticated ? (
            <div>
              {nomType && (
                <button onClick={() => setNomType(null)}
                  className="flex items-center gap-1 text-foreground/65 hover:text-foreground text-sm mb-6 transition-colors min-h-[44px]">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              {nomType === "student" ? (
                <StudentNominationForm />
              ) : nomType === "self" ? (
                <TeacherSelfNominationForm />
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
                    Welcome, {user?.name || "there"}!
                  </h1>
                  <p className="text-foreground/65 text-center mb-8 text-sm sm:text-base">Choose how you'd like to participate</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { type: "student" as const, icon: Users, title: "Nominate a Teacher", desc: "Recognize an amazing educator who changed your life", color: "hover:border-secondary" },
                      { type: "self" as const, icon: UserCheck, title: "Apply as Teacher", desc: "Showcase your teaching impact and innovations", color: "hover:border-primary" },
                    ].map(opt => (
                      <button key={opt.type} onClick={() => setNomType(opt.type)}
                        className={`bg-card rounded-2xl p-6 border border-border/50 text-left transition-all ${opt.color} min-h-[120px] active:scale-[0.98]`}>
                        <opt.icon className="w-8 h-8 text-foreground/60 mb-3" />
                        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{opt.title}</h3>
                        <p className="text-foreground/65 text-sm">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-foreground/65">Please login to continue with your nomination.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};

export default NominatePage;

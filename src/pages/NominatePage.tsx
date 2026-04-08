import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
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

  // Update nomType when URL params change
  useEffect(() => {
    if (paramType === "self") setNomType("self");
    else if (paramType === "student") setNomType("student");
  }, [paramType]);

  // If not authenticated, show login dialog
  useEffect(() => {
    if (!isAuthenticated) {
      setLoginOpen(true);
    }
  }, [isAuthenticated]);

  // Auto-select nom type based on user role
  useEffect(() => {
    if (isAuthenticated && user && !nomType) {
      if (user.role === "teacher") setNomType("self");
      else setNomType("student");
    }
  }, [isAuthenticated, user, nomType]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container max-w-2xl">
          {isAuthenticated ? (
            <div>
              {nomType && (
                <button
                  onClick={() => setNomType(null)}
                  className="flex items-center gap-1 text-foreground/65 hover:text-foreground text-sm mb-6 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              {nomType === "student" ? (
                <StudentNominationForm />
              ) : nomType === "self" ? (
                <TeacherSelfNominationForm />
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">
                    Welcome, {user?.name || "User"}!
                  </h1>
                  <p className="text-foreground/65 text-center mb-8">
                    Choose your nomination type to continue
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setNomType("student")}
                      className="bg-card rounded-2xl p-6 border border-border/50 text-left hover:border-secondary transition-all"
                    >
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Nominate a Teacher</h3>
                      <p className="text-foreground/65 text-sm">Recognize an amazing educator</p>
                    </button>
                    <button
                      onClick={() => setNomType("self")}
                      className="bg-card rounded-2xl p-6 border border-border/50 text-left hover:border-accent transition-all"
                    >
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Apply as Teacher</h3>
                      <p className="text-foreground/65 text-sm">Showcase your impact</p>
                    </button>
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

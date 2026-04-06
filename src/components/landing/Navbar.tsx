import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Award, LogIn, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";



const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const links = [
    { label: "Award Categories", to: "/#categories" },
    { label: "How It Works", to: "/#how-it-works" },
    { label: "Prizes", to: "/#prizes" },
    { label: "Admin", to: "/admin" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-foreground/95 backdrop-blur-lg border-b border-primary-foreground/10">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center border border-primary-foreground/20 flex-shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="block">
              <span className="font-heading font-bold text-xs sm:text-sm text-primary leading-none block">NIAT</span>
              <span className="font-heading text-[9px] sm:text-[10px] text-primary-foreground/60 leading-none">
                Future-Ready Educator Awards
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                {l.label}
              </Link>
            ))}
            <Link to="/nominate">
              <Button variant="hero" size="sm">Nominate a Teacher</Button>
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-primary-foreground/50 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />{user?.phone}
                </span>
                <button onClick={logout} className="text-primary-foreground/50 hover:text-primary-foreground transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="hero-outline" size="sm" className="gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: auth + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <button onClick={logout} className="text-primary-foreground/50 hover:text-primary-foreground p-1.5" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button className="p-2 text-primary-foreground" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-foreground border-b border-primary-foreground/10"
            >
              <div className="container py-3 flex flex-col gap-1 px-3">
                {links.map((l) => (
                  <Link key={l.to} to={l.to}
                    className="text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground py-2.5 border-b border-primary-foreground/5 last:border-0"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="pt-2 pb-1 flex flex-col gap-2">
                  <Link to="/nominate" onClick={() => setOpen(false)}>
                    <Button variant="hero" className="w-full">Nominate a Teacher</Button>
                  </Link>
                  {!isAuthenticated && (
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <Button variant="hero-outline" className="w-full gap-1.5">
                        <LogIn className="w-3.5 h-3.5" />Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;

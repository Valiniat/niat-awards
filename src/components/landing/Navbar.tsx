import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    setOpen(false);
    if (location.pathname === "/") {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/" + hash);
    }
  };

  const links = [
    { label: "Award Categories", hash: "#categories" },
    { label: "How It Works", hash: "#how-it-works" },
    { label: "Prizes", hash: "#prizes" },
    { label: "Admin", hash: null, to: "/admin-login" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-[#0f0f0f]/96 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container flex items-center justify-between h-[60px] sm:h-[68px] px-4 sm:px-6">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            {/* Logo badge — crimson pill that frames the shield */}
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] shadow-lg shadow-[#8B1A1A]/30 ring-1 ring-white/10 group-hover:shadow-[#8B1A1A]/50 transition-all duration-300 flex-shrink-0">
              <img
                src="/niat-logo.png"
                alt="NIAT"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm"
              />
            </div>
            {/* Wordmark */}
            <div className="flex flex-col justify-center leading-none">
              <span className="font-heading font-bold text-[13px] sm:text-[14px] tracking-wide text-white group-hover:text-white/90 transition-colors">
                NIAT
              </span>
              <span className="text-[9px] sm:text-[10px] text-white/40 font-medium tracking-wide mt-[1px]">
                Educator Awards 2026
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) =>
              l.to ? (
                <Link key={l.to} to={l.to}
                  className="text-[13px] font-medium text-white/50 hover:text-white/90 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                  {l.label}
                </Link>
              ) : (
                <a key={l.hash} href={l.hash!}
                  onClick={(e) => handleNavClick(e, l.hash!)}
                  className="text-[13px] font-medium text-white/50 hover:text-white/90 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer">
                  {l.label}
                </a>
              )
            )}
          </div>

          {/* ── CTA + Auth ── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 flex items-center gap-1.5">
                  <User className="w-3 h-3" />{user?.phone}
                </span>
                <button onClick={logout}
                  className="text-white/30 hover:text-white/70 transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="text-[13px] font-medium text-white/50 hover:text-white/80 flex items-center gap-1.5 transition-colors">
                  <LogIn className="w-3.5 h-3.5" /> Login
                </button>
              </Link>
            )}
            <Link to="/nominate">
              <button className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-gradient-to-br from-[#9B2020] to-[#7A1515] text-white shadow-md shadow-[#8B1A1A]/30 hover:shadow-[#8B1A1A]/50 hover:from-[#A52222] hover:to-[#851717] transition-all duration-200 ring-1 ring-white/10">
                Nominate a Teacher
              </button>
            </Link>
          </div>

          {/* ── Mobile hamburger ── */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <button onClick={logout} className="text-white/40 hover:text-white/70 p-1.5">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button className="p-2 text-white/60 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-[#0f0f0f] border-t border-white/[0.06]"
            >
              <div className="container py-3 flex flex-col px-4">
                {links.map((l) =>
                  l.to ? (
                    <Link key={l.to} to={l.to}
                      className="text-[13px] font-medium text-white/50 hover:text-white py-3 border-b border-white/[0.04] last:border-0 transition-colors"
                      onClick={() => setOpen(false)}>
                      {l.label}
                    </Link>
                  ) : (
                    <a key={l.hash} href={l.hash!}
                      onClick={(e) => handleNavClick(e, l.hash!)}
                      className="text-[13px] font-medium text-white/50 hover:text-white py-3 border-b border-white/[0.04] last:border-0 transition-colors cursor-pointer">
                      {l.label}
                    </a>
                  )
                )}
                <div className="pt-3 pb-1 flex flex-col gap-2">
                  <Link to="/nominate" onClick={() => setOpen(false)}>
                    <button className="w-full text-[13px] font-semibold py-2.5 rounded-lg bg-gradient-to-br from-[#9B2020] to-[#7A1515] text-white ring-1 ring-white/10">
                      Nominate a Teacher
                    </button>
                  </Link>
                  {!isAuthenticated && (
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <button className="w-full text-[13px] font-medium py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all">
                        Login
                      </button>
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

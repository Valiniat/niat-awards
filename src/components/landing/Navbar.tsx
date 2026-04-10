import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const MAROON = "#6B1212";
const MAROON_DARK = "#550F0F";

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
  ];

  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Full-width solid maroon bar — no transparency, no blur leaking */}
      <nav style={{ backgroundColor: MAROON }} className="border-b border-black/20 shadow-lg shadow-black/30">
        <div className="container flex items-center justify-between h-[60px] sm:h-[68px] px-4 sm:px-6">

          {/* Logo */}
          <Link to="/" className="flex flex-row group flex-shrink-0" style={{ alignItems: "center", gap: "8px" }}>
            <img
              src="/niat-logo.png"
              alt="NIAT"
              style={{ width: "38px", height: "38px", objectFit: "contain", display: "block", flexShrink: 0 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", justifyContent: "center" }}>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: "17px", lineHeight: 1, color: "white", letterSpacing: "0.02em" }}>NIAT</span>
              <span style={{ fontWeight: 500, fontSize: "9.5px", lineHeight: 1, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>Nxtwave of Innovation in Advanced Technologies</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((l) => (
              <a key={l.hash} href={l.hash}
                onClick={(e) => handleNavClick(e, l.hash)}
                className="text-[13px] font-medium text-white/70 hover:text-white px-3.5 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer">
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side — auth + CTA */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* User pill */}
                <div className="flex items-center gap-2.5 bg-black/20 border border-white/15 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-white">{initials}</span>
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[12px] font-semibold text-white leading-tight">
                      {user?.name || "Welcome"}
                    </span>
                    <span className="text-[10px] text-white/50 leading-tight">+91 {user?.phone}</span>
                  </div>
                </div>
                <button onClick={logout} title="Logout"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="text-[13px] font-medium text-white/65 hover:text-white flex items-center gap-1.5 transition-colors px-2 py-1.5">
                  <LogIn className="w-3.5 h-3.5" /> Login
                </button>
              </Link>
            )}
            <Link to="/nominate">
              <button className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-white text-[#6B1212] hover:bg-white/90 transition-all shadow-sm font-bold">
                Nominate a Teacher
              </button>
            </Link>
          </div>

          {/* Mobile right */}
          <div className="flex items-center gap-1.5 md:hidden">
            {isAuthenticated && (
              <div className="flex items-center gap-1.5 bg-black/20 border border-white/15 rounded-lg px-2.5 py-1 mr-1">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">{initials}</span>
                </div>
                <span className="text-[11px] font-semibold text-white max-w-[80px] truncate">
                  {user?.name || "Hi!"}
                </span>
              </div>
            )}
            <button className="p-2 text-white/80 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
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
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-black/20"
              style={{ backgroundColor: MAROON_DARK }}
            >
              <div className="container py-3 flex flex-col px-4">
                {links.map((l) => (
                  <a key={l.hash} href={l.hash}
                    onClick={(e) => handleNavClick(e, l.hash)}
                    className="text-[14px] font-medium text-white/70 hover:text-white py-3.5 border-b border-white/[0.08] last:border-0 transition-colors cursor-pointer">
                    {l.label}
                  </a>
                ))}
                <div className="pt-4 pb-2 flex flex-col gap-2.5">
                  <Link to="/nominate" onClick={() => setOpen(false)}>
                    <button className="w-full text-[14px] font-bold py-3 rounded-xl bg-white text-[#6B1212]">
                      Nominate a Teacher
                    </button>
                  </Link>
                  {!isAuthenticated ? (
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <button className="w-full text-[14px] font-medium py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition-all">
                        Login
                      </button>
                    </Link>
                  ) : (
                    <button onClick={() => { logout(); setOpen(false); }}
                      className="w-full text-[14px] font-medium py-3 rounded-xl border border-white/20 text-white/80 flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
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

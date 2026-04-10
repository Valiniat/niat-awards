import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-[#0a0a0a] border-t border-white/[0.05]">
    {/* Top section */}
    <div className="container px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-8">

        {/* Brand block */}
        <div className="flex flex-col gap-4 max-w-xs">
          <div className="flex items-center gap-3">
            <img src="/niat-logo.png" alt="NIAT" className="w-10 h-10 object-contain flex-shrink-0" />
            <div className="leading-none">
              <p className="font-heading font-bold text-[15px] text-white tracking-wide">NIAT</p>
              <p className="text-[10px] text-white/35 font-medium mt-0.5 tracking-wide">Educator Awards 2026</p>
            </div>
          </div>
          <p className="text-[13px] text-white/30 leading-relaxed">
            Celebrating India's most impactful teachers. Nominating the educators who build futures, not just scores.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-12 sm:gap-16">
          <div>
            <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-3">Navigate</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Home", to: "/" },
                { label: "Nominate", to: "/nominate" },
                { label: "Vote", to: "/vote" },
              ].map(l => (
                <Link key={l.to} to={l.to}
                  className="text-[13px] text-white/40 hover:text-white/80 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-3">Awards</p>
            <div className="flex flex-col gap-2">
              {["Student Transformation", "Teaching Innovation", "Beyond Classroom", "Future Readiness"].map(l => (
                <span key={l} className="text-[13px] text-white/40">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/[0.04]">
      <div className="container px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[11px] text-white/20">
          © 2026 Nxtwave of Innovation in Advanced Technologies. All rights reserved.
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-white/20">All systems operational</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

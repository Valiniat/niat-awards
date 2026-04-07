import { Award } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="py-8 sm:py-12 bg-gradient-dark">
    <div className="container px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <img src="/niat-logo.png" alt="NIAT Logo" className="w-8 h-8 object-contain" />
          <span className="font-heading font-bold text-primary-foreground text-sm sm:text-base">
            NIAT Educator Awards 2026
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-primary-foreground/40 text-sm">
          <Link to="/" className="hover:text-primary-foreground/70 transition-colors">Home</Link>
          <Link to="/nominate" className="hover:text-primary-foreground/70 transition-colors">Nominate</Link>
          <Link to="/vote" className="hover:text-primary-foreground/70 transition-colors">Vote</Link>
        </div>
        <p className="text-primary-foreground/40 text-xs sm:text-sm">
          © 2026 NxtWave Institute of Advanced Technologies
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

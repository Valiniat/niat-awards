import { Award } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="py-12 bg-gradient-dark">
    <div className="container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center border border-primary-foreground/20">
            <Award className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-primary-foreground">
            NIAT Educator Awards 2026
          </span>
        </div>
        <div className="flex items-center gap-6 text-primary-foreground/40 text-sm">
          <Link to="/" className="hover:text-primary-foreground/70 transition-colors">Home</Link>
          <Link to="/nominate" className="hover:text-primary-foreground/70 transition-colors">Nominate</Link>
          <Link to="/vote" className="hover:text-primary-foreground/70 transition-colors">Vote</Link>
        </div>
        <p className="text-primary-foreground/40 text-sm text-center">
          © 2026 NxtWave Institute of Advanced Technologies
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

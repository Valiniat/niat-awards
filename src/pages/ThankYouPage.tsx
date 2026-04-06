import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Share2, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const ThankYouPage = () => {
  const shareText = encodeURIComponent(
    "I just nominated my favourite teacher for India's Future-Ready Educator Awards 2026 by NIAT! 🏆 Nominate yours too: "
  );
  const shareUrl = encodeURIComponent(window.location.origin);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
        <div className="container max-w-lg text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}>
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
              Nomination Submitted! 🎉
            </h1>
            <p className="text-muted-foreground text-lg mb-2">
              Your nomination has been submitted successfully!
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              Updates will be sent via WhatsApp to the phone number you provided.
            </p>

            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-8">
              <p className="font-heading font-semibold text-foreground mb-3">
                Help your teacher get recognized by sharing this! 🙏
              </p>
              <a
                href={`https://wa.me/?text=${shareText}${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="hero" className="gap-2 w-full rounded-xl">
                  <Share2 className="w-4 h-4" /> Share on WhatsApp
                </Button>
              </a>
            </div>

            <Link to="/nominate">
              <Button variant="outline" className="gap-2 rounded-xl">
                Nominate Another Teacher <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ThankYouPage;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FinalCTASection = () => (
  <section className="py-24 bg-gradient-dark relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
    </div>
    <div className="container relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
          Every great teacher deserves to be celebrated
        </h2>
        <p className="text-primary-foreground/60 text-lg max-w-xl mx-auto mb-10">
          Nominate a teacher today and help them get the recognition they truly deserve.
        </p>
        <Link to="/nominate">
          <Button variant="hero" size="lg" className="text-base px-10 py-6 rounded-lg gap-3">
            Nominate Now <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  </section>
);

export default FinalCTASection;

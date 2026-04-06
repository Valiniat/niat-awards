import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FinalCTASection = () => (
  <section className="py-16 sm:py-24 bg-gradient-dark relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-36 sm:w-72 h-36 sm:h-72 bg-secondary/10 rounded-full blur-3xl" />
    </div>
    <div className="container relative z-10 text-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
          Every great teacher deserves to be celebrated
        </h2>
        <p className="text-primary-foreground/60 text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10">
          Nominate a teacher today and help them get the recognition they truly deserve.
        </p>
        <Link to="/nominate">
          <Button variant="hero" size="lg" className="text-sm sm:text-base px-8 sm:px-10 py-5 sm:py-6 rounded-lg gap-2 sm:gap-3 w-full sm:w-auto">
            Nominate Now <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  </section>
);

export default FinalCTASection;

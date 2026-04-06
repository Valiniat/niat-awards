import { motion } from "framer-motion";
import { FileText, Search, Vote, Trophy } from "lucide-react";

const steps = [
  { icon: FileText, title: "Nominate", desc: "Students or teachers submit nominations with stories of impact." },
  { icon: Search, title: "Review & Shortlist", desc: "Expert panel reviews nominations for authenticity and impact." },
  { icon: Vote, title: "People's Choice Voting", desc: "Public voting to support shortlisted teachers." },
  { icon: Trophy, title: "Winners Announced", desc: "National recognition ceremony with awards and media coverage." },
];

const HowItWorksSection = () => (
  <section className="py-14 sm:py-20 bg-muted" id="how-it-works">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">How Selection Works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">A transparent, multi-stage process ensuring only the most deserving educators are recognized.</p>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {steps.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            className="relative text-center px-2 sm:px-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 sm:mb-5 relative">
              <s.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
              <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-[10px] sm:text-xs font-bold">
                {i + 1}
              </div>
            </div>
            <h3 className="font-heading text-sm sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

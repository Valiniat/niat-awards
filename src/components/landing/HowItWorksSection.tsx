import { motion } from "framer-motion";
import { FileText, Search, Vote, Trophy } from "lucide-react";

const steps = [
  { icon: FileText, title: "Nominate", desc: "Students or teachers submit nominations with stories of impact." },
  { icon: Search, title: "Review & Shortlist", desc: "Expert panel reviews nominations for authenticity and impact." },
  { icon: Vote, title: "People's Choice Voting", desc: "Public voting to support shortlisted teachers." },
  { icon: Trophy, title: "Winners Announced", desc: "National recognition ceremony with awards and media coverage." },
];

const HowItWorksSection = () => (
  <section className="py-20 bg-muted">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
          How Selection Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          A transparent, multi-stage process ensuring only the most deserving educators are recognized.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative text-center"
          >
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-5 relative">
              <s.icon className="w-7 h-7 text-primary-foreground" />
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold">
                {i + 1}
              </div>
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

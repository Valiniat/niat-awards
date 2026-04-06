import { motion } from "framer-motion";
import { Heart, Users, Lightbulb } from "lucide-react";

const reasons = [
  { icon: Heart, title: "Every Teacher Matters", desc: "Millions of teachers work tirelessly, yet remain unrecognized. This initiative changes that — giving voice to students who want to say 'thank you.'" },
  { icon: Users, title: "Student-Powered Recognition", desc: "Students nominate their favourite teachers. No bureaucracy, no committees — just honest gratitude from those who matter most." },
  { icon: Lightbulb, title: "Celebrating Innovation", desc: "We honour educators who think differently — using technology, creativity, and compassion to prepare students for a rapidly changing world." },
];

const WhySection = () => (
  <section className="py-14 sm:py-20 bg-card">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">Why This Exists</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">Because the best teachers don't just teach — they transform lives.</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
        {reasons.map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
            className="bg-background rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-elevated transition-shadow duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 sm:mb-5">
              <r.icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">{r.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{r.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WhySection;

import { motion } from "framer-motion";
import { Star, Lightbulb, Globe, Rocket } from "lucide-react";

const categories = [
  {
    icon: Star,
    title: "Student Transformation Award",
    desc: "For teachers who have truly changed the trajectory of a student's life through mentorship and care.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Lightbulb,
    title: "Teaching Innovation Award",
    desc: "For educators who bring creativity, technology, and fresh methods into the classroom.",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: Globe,
    title: "Beyond Classroom Impact Award",
    desc: "For those who go beyond syllabus — community work, life skills, emotional support.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Rocket,
    title: "Future Readiness Award",
    desc: "For teachers preparing students for careers of tomorrow with practical, future-focused education.",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
];

const CategoriesSection = () => (
  <section className="py-20 bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Award Categories
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Four distinct categories celebrating different dimensions of exceptional teaching.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6">
        {categories.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-border group hover:-translate-y-1"
          >
            <div className={`w-14 h-14 rounded-xl ${c.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              <c.icon className={`w-7 h-7 ${c.iconColor}`} />
            </div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{c.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;

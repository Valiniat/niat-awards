import { motion } from "framer-motion";
import { Trophy, Newspaper, Award, GraduationCap } from "lucide-react";

const prizes = [
  { icon: Trophy, title: "National Trophy & Certificate", desc: "Official recognition from NIAT" },
  { icon: Newspaper, title: "Media Coverage", desc: "Featured in national education publications" },
  { icon: Award, title: "Cash Prize & Grants", desc: "Monetary awards for personal & school development" },
  { icon: GraduationCap, title: "Professional Development", desc: "Exclusive workshops and networking opportunities" },
];

const WinnersReceiveSection = () => (
  <section className="py-20 bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
          What Winners Receive
        </h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {prizes.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-6 text-center shadow-card border border-border/50"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <p.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">{p.title}</h3>
            <p className="text-muted-foreground text-sm">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WinnersReceiveSection;

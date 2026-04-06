import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, Share2, Star } from "lucide-react";
import { useState } from "react";

const mockTeachers = [
  { id: 1, name: "Priya Sharma", school: "DPS Hyderabad", category: "Student Transformation Award", votes: 142, story: "Transformed struggling students into top performers through personalized mentoring." },
  { id: 2, name: "Rajesh Kumar", school: "Kendriya Vidyalaya, Delhi", category: "Teaching Innovation Award", votes: 98, story: "Uses gamification and AR to make physics come alive in the classroom." },
  { id: 3, name: "Anita Desai", school: "St. Xavier's, Mumbai", category: "Beyond Classroom Impact Award", votes: 215, story: "Started a community literacy program reaching 500+ children in rural areas." },
  { id: 4, name: "Mohammed Rafi", school: "Govt. School, Lucknow", category: "Future Readiness Award", votes: 76, story: "Teaching coding and AI to government school students with zero resources." },
];

const VotePage = () => {
  const [search, setSearch] = useState("");
  const filtered = mockTeachers.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.school.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-10">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              People's Choice Award
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Support your favourite teacher by casting your vote. Every vote counts!
            </p>
          </motion.div>

          <div className="max-w-md mx-auto mb-8 sm:mb-10 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 rounded-xl" placeholder="Search by teacher or school..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {filtered.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-4 sm:p-6 shadow-card border border-border/50 hover:shadow-elevated transition-all">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-base sm:text-lg shrink-0">
                    {t.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base truncate">{t.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{t.school}</p>
                    <span className="inline-block mt-1 text-[10px] sm:text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                      {t.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">{t.story}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent fill-accent" /> {t.votes} votes
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg gap-1 sm:gap-1.5 text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3">
                      <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button variant="hero" size="sm" className="rounded-lg gap-1 sm:gap-1.5 text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3">
                      <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Vote
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VotePage;

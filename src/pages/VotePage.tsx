import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, Share2, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const VotePage = () => {
  const [nominations, setNominations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [voting, setVoting] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchShortlisted = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("nominations")
        .select("*")
        .in("status", ["shortlisted", "winner"])
        .order("created_at", { ascending: false });
      if (!error) setNominations(data || []);
      setLoading(false);
    };
    fetchShortlisted();
  }, []);

  const handleVote = async (nominationId: string) => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to vote.", variant: "destructive" });
      return;
    }
    setVoting(nominationId);
    const { error } = await supabase.from("votes").insert({ nomination_id: nominationId, voter_phone: user.phone });
    if (error) {
      if (error.code === "23505") toast({ title: "Already voted", description: "You've already voted for this teacher." });
      else toast({ title: "Vote failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vote cast! 🎉", description: "Thank you for supporting this teacher." });
    }
    setVoting(null);
  };

  const filtered = nominations.filter(n => {
    const name = (n.teacher_name || n.full_name || "").toLowerCase();
    const school = (n.school_name || "").toLowerCase();
    return name.includes(search.toLowerCase()) || school.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-10">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              People's Choice Award
            </h1>
            <p className="text-foreground/65 text-base sm:text-lg max-w-xl mx-auto">
              Support your favourite teacher by casting your vote. Every vote counts!
            </p>
          </motion.div>

          <div className="max-w-md mx-auto mb-8 sm:mb-10 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/65" />
            <Input className="pl-10 rounded-xl" placeholder="Search by teacher or school..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
              <span className="ml-3 text-foreground/65">Loading shortlisted teachers...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-foreground/65">
              {nominations.length === 0
                ? "Shortlisted teachers will appear here once the panel reviews nominations."
                : "No teachers match your search."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {filtered.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-2xl p-4 sm:p-6 shadow-card border border-border/50 hover:shadow-elevated transition-all">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-base sm:text-lg shrink-0">
                      {(n.teacher_name || n.full_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base truncate">
                        {n.teacher_name || n.full_name || "—"}
                      </h3>
                      <p className="text-xs sm:text-sm text-foreground/65 truncate">{n.school_name || "—"}</p>
                      <span className="inline-block mt-1 text-[10px] sm:text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                        {n.award_category}
                      </span>
                    </div>
                  </div>
                  {n.special_thing && <p className="text-xs sm:text-sm text-foreground/65 mb-3 sm:mb-4 leading-relaxed line-clamp-2">{n.special_thing}</p>}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-foreground/65">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent fill-accent" />
                      {n.status === "winner" ? "Winner 🏆" : "Shortlisted"}
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg gap-1 sm:gap-1.5 text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
                        onClick={() => { navigator.share?.({ title: "Vote for this teacher!", url: window.location.href }) || navigator.clipboard.writeText(window.location.href); }}>
                        <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                      <Button variant="hero" size="sm" className="rounded-lg gap-1 sm:gap-1.5 text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
                        onClick={() => handleVote(n.id)} disabled={voting === n.id}>
                        {voting === n.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                        Vote
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VotePage;

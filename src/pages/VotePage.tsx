import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ThumbsUp, Share2, Star, Loader2, Trophy, Users, Award, Filter, ChevronDown, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = ["All", "Student Transformation Award", "Teaching Innovation Award", "Beyond Classroom Impact Award", "Future Readiness Award"];

const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  "Student Transformation Award":  { bg: "bg-amber-400/10",   text: "text-amber-400",   border: "border-amber-400/30" },
  "Teaching Innovation Award":     { bg: "bg-blue-400/10",    text: "text-blue-400",    border: "border-blue-400/30" },
  "Beyond Classroom Impact Award": { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/30" },
  "Future Readiness Award":        { bg: "bg-purple-400/10",  text: "text-purple-400",  border: "border-purple-400/30" },
};

const VoteCard = ({ nomination, onVote, voting, votedIds }: any) => {
  const colors = categoryColor[nomination.award_category] || { bg: "bg-white/5", text: "text-white/60", border: "border-white/10" };
  const hasVoted = votedIds.has(nomination.id);
  const name = nomination.teacher_name || nomination.full_name || "—";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl border bg-white/[0.03] overflow-hidden group transition-all duration-300 ${
        hasVoted ? "border-secondary/40 shadow-lg shadow-secondary/10" : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Winner badge */}
      {nomination.status === "winner" && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 rounded-full px-2.5 py-1">
          <Trophy className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">Winner</span>
        </div>
      )}

      {/* Voted overlay */}
      {hasVoted && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-secondary/15 border border-secondary/30 rounded-full px-2.5 py-1">
          <CheckCircle2 className="w-3 h-3 text-secondary" />
          <span className="text-[10px] font-bold text-secondary">Voted</span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Top — avatar + name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] flex items-center justify-center shadow-lg">
              <span className="font-heading font-bold text-base sm:text-lg text-white">{initials}</span>
            </div>
            {nomination.status === "winner" && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center border-2 border-[#060606]">
                <Trophy className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-bold text-white text-base sm:text-lg truncate leading-tight">{name}</h3>
            <p className="text-white/50 text-xs sm:text-sm truncate mt-0.5">{nomination.school_name || "—"}</p>
            <span className={`inline-flex items-center gap-1 mt-2 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
              <Award className="w-2.5 h-2.5" />
              {nomination.award_category?.replace(" Award", "")}
            </span>
          </div>
        </div>

        {/* Impact story */}
        {(nomination.special_thing || nomination.impact_story) && (
          <p className="text-white/55 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 italic">
            "{nomination.special_thing || nomination.impact_story}"
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-white/[0.06] mb-4" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: hasVoted ? 1 : 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => !hasVoted && onVote(nomination.id)}
            disabled={voting === nomination.id || hasVoted}
            className={`flex-1 h-10 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
              hasVoted
                ? "bg-secondary/15 border border-secondary/30 text-secondary cursor-default"
                : "bg-gradient-to-r from-[#9B2020] to-[#7A1515] text-white shadow-md shadow-primary/20 hover:shadow-primary/40 disabled:opacity-60"
            }`}
          >
            {!hasVoted && (
              <motion.div animate={{ x: [-200, 400] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />
            )}
            {voting === nomination.id
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : hasVoted
              ? <><CheckCircle2 className="w-4 h-4" /> Voted</>
              : <><ThumbsUp className="w-4 h-4" /> Vote</>
            }
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => {
              const text = `Vote for ${name} — NIAT Educator Awards 2026! 🏆\n${window.location.href}`;
              if (navigator.share) navigator.share({ title: "Vote for this teacher!", text, url: window.location.href });
              else navigator.clipboard.writeText(text).then(() => {});
            }}
            className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const VotePage = () => {
  const [nominations, setNominations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [voting, setVoting] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

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

    // Load voted IDs from localStorage
    const stored = localStorage.getItem("niat_voted_ids");
    if (stored) setVotedIds(new Set(JSON.parse(stored)));
  }, []);

  const handleVote = async (nominationId: string) => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please login to cast your vote.", variant: "destructive" });
      return;
    }
    if (votedIds.has(nominationId)) return;

    setVoting(nominationId);
    const { error } = await supabase.from("votes").insert({ nomination_id: nominationId, voter_phone: user?.phone });
    setVoting(null);

    if (error) {
      if (error.code === "23505") toast({ title: "Already voted!", description: "You've already voted for this teacher." });
      else toast({ title: "Vote failed", description: error.message, variant: "destructive" });
    } else {
      const newVoted = new Set([...votedIds, nominationId]);
      setVotedIds(newVoted);
      localStorage.setItem("niat_voted_ids", JSON.stringify([...newVoted]));
      toast({ title: "🎉 Vote cast!", description: `Thank you for supporting this teacher!` });
    }
  };

  const filtered = nominations.filter(n => {
    const name = (n.teacher_name || n.full_name || "").toLowerCase();
    const school = (n.school_name || "").toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || school.includes(search.toLowerCase());
    const matchCat = category === "All" || n.award_category === category;
    return matchSearch && matchCat;
  });

  const stats = {
    total: nominations.length,
    shortlisted: nominations.filter(n => n.status === "shortlisted").length,
    winners: nominations.filter(n => n.status === "winner").length,
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />

      {/* Hero banner */}
      <div className="pt-[68px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
        </div>
        <div className="container relative z-10 px-4 pt-12 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-widest mb-5">
              <Star className="w-3 h-3" /> People's Choice Voting
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Vote for Your Favourite<br className="hidden sm:block" /> Teacher
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto mb-8">
              Every vote recognizes a life-changing educator. Cast yours before May 31st.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {[
                { icon: Users, label: "Shortlisted", value: stats.shortlisted },
                { icon: Trophy, label: "Winners", value: stats.winners },
                { icon: ThumbsUp, label: "Votes Cast", value: votedIds.size },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white font-heading">{s.value}</div>
                  <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="sticky top-[68px] z-20 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teacher or school..."
              className="w-full pl-10 pr-4 h-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/35 text-sm focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all"
            />
          </div>
          {/* Category filter */}
          <div className="relative">
            <button onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/8 hover:text-white transition-all">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{category === "All" ? "All Categories" : category.replace(" Award", "")}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilter ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showFilter && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-64 bg-[#141414] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => { setCategory(c); setShowFilter(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/[0.04] last:border-0 ${
                        category === c ? "text-secondary bg-secondary/5 font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}>
                      {c === "All" ? "All Categories" : c}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container px-4 py-8 sm:py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            <p className="text-white/40 text-sm">Loading shortlisted teachers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white font-semibold text-lg">
              {nominations.length === 0 ? "Voting opens soon" : "No results found"}
            </p>
            <p className="text-white/40 text-sm max-w-xs">
              {nominations.length === 0
                ? "Shortlisted teachers will appear here once nominations are reviewed by the panel."
                : "Try adjusting your search or filter."}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/40 text-sm">
                Showing <span className="text-white font-semibold">{filtered.length}</span> teacher{filtered.length !== 1 ? "s" : ""}
                {category !== "All" && <span className="text-secondary"> · {category.replace(" Award", "")}</span>}
              </p>
              {!isAuthenticated && (
                <p className="text-xs text-white/30">Login to cast your vote</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <VoteCard nomination={n} onVote={handleVote} voting={voting} votedIds={votedIds} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VotePage;

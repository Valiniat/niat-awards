import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ThumbsUp, Share2, Star, Loader2, Trophy, Users, Award, Filter, ChevronDown, CheckCircle2, TrendingUp, BarChart2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All", "Student Transformation Award", "Teaching Innovation Award", "Beyond Classroom Impact Award", "Future Readiness Award"];

const catStyle: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  "Student Transformation Award":  { bg: "bg-amber-400/10",   text: "text-amber-400",   border: "border-amber-400/30",   bar: "bg-amber-400" },
  "Teaching Innovation Award":     { bg: "bg-blue-400/10",    text: "text-blue-400",    border: "border-blue-400/30",    bar: "bg-blue-400" },
  "Beyond Classroom Impact Award": { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/30", bar: "bg-emerald-400" },
  "Future Readiness Award":        { bg: "bg-purple-400/10",  text: "text-purple-400",  border: "border-purple-400/30",  bar: "bg-purple-400" },
};

const VotePage = () => {
  const [nominations, setNominations] = useState<any[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const filterRef = useRef<HTMLDivElement>(null);

  // FIX: close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Fetch all data ──
  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch shortlisted/winner nominations
    const { data: noms } = await supabase
      .from("nominations")
      .select("*")
      .in("status", ["shortlisted", "winner"])
      .order("created_at", { ascending: false });

    if (!noms) { setLoading(false); return; }
    setNominations(noms);

    // 2. Fetch vote counts for all nominations in one query
    const { data: votes } = await supabase
      .from("votes")
      .select("nomination_id");

    if (votes) {
      const counts: Record<string, number> = {};
      votes.forEach(v => {
        counts[v.nomination_id] = (counts[v.nomination_id] || 0) + 1;
      });
      setVoteCounts(counts);
    }

    // 3. Fetch this user's votes to show "already voted"
    if (user?.phone) {
      const { data: userVotes } = await supabase
        .from("votes")
        .select("nomination_id")
        .eq("voter_phone", user.phone);
      if (userVotes) setMyVotes(new Set(userVotes.map(v => v.nomination_id)));
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user?.phone]);

  // ── Cast vote ──
  const handleVote = async (nominationId: string, teacherName: string) => {
    if (!isAuthenticated || !user?.phone) {
      toast({
        title: "Login required",
        description: "Please login to cast your vote.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    if (myVotes.has(nominationId)) {
      toast({ title: "Already voted", description: "You've already voted for this teacher." });
      return;
    }

    setVoting(nominationId);
    const { error } = await supabase.from("votes").insert({
      nomination_id: nominationId,
      voter_phone: user.phone,
    });
    setVoting(null);

    if (error) {
      if (error.code === "23505") {
        // Duplicate — sync local state
        setMyVotes(prev => new Set([...prev, nominationId]));
        toast({ title: "Already voted!", description: "You've already voted for this teacher." });
      } else {
        toast({ title: "Vote failed", description: error.message, variant: "destructive" });
      }
    } else {
      // Optimistically update counts
      setMyVotes(prev => new Set([...prev, nominationId]));
      setVoteCounts(prev => ({ ...prev, [nominationId]: (prev[nominationId] || 0) + 1 }));
      toast({ title: "🎉 Vote cast!", description: `You voted for ${teacherName}. Thank you!` });
    }
  };

  // ── Filter + Sort ──
  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(voteCounts), 1);

  const filtered = nominations
    .filter(n => {
      const name = (n.teacher_name || n.full_name || "").toLowerCase();
      const school = (n.school_name || "").toLowerCase();
      return (
        (name.includes(search.toLowerCase()) || school.includes(search.toLowerCase())) &&
        (category === "All" || n.award_category === category)
      );
    })
    .sort((a, b) => {
      if (sortBy === "votes") return (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Rank nominations by vote count (for #1, #2, #3 badges)
  const ranked = [...nominations].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
  const rankMap: Record<string, number> = {};
  ranked.forEach((n, i) => { rankMap[n.id] = i + 1; });

  return (
    <div className="min-h-screen bg-gradient-dark" id="main-content" role="main">
      <Navbar />

      {/* Hero */}
      <div className="pt-[56px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 7, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[150px]" />
          <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 9, repeat: Infinity }}
            className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-secondary rounded-full blur-[130px]" />
        </div>
        <div className="container relative z-10 px-4 pt-12 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-widest mb-5">
              <Star className="w-3 h-3 fill-secondary" /> People's Choice Voting · May 1–31
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Vote for Your Favourite Teacher
            </h1>
            <p className="text-white/55 text-base sm:text-lg max-w-xl mx-auto mb-10">
              Every vote is recorded and counts toward the People's Choice Award.
            </p>

            {/* Live stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-16">
              {[
                { icon: Users,    label: "Shortlisted", value: nominations.length },
                { icon: ThumbsUp, label: "Total Votes",  value: totalVotes },
                { icon: Trophy,   label: "Winners",      value: nominations.filter(n => n.status === "winner").length },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white font-heading">{s.value}</div>
                  <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky search + filter bar */}
      <div className="sticky top-[56px] z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container px-4 py-3 flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search teacher or school..."
              className="w-full pl-10 pr-4 h-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/20 transition-all" />
          </div>

          {/* Sort */}
          <button onClick={() => setSortBy(s => s === "votes" ? "recent" : "votes")}
            className={`flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl border text-xs font-semibold transition-all flex-shrink-0 ${
              sortBy === "votes" ? "bg-secondary/15 border-secondary/30 text-secondary" : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}>
            {sortBy === "votes" ? <BarChart2 className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{sortBy === "votes" ? "By Votes" : "Recent"}</span>
          </button>

          {/* Category filter */}
          <div className="relative flex-shrink-0" ref={filterRef}>
            <button onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold hover:text-white hover:bg-white/8 transition-all">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline max-w-[100px] truncate">{category === "All" ? "Category" : category.replace(" Award", "")}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilter ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showFilter && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-64 bg-[#141414] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => { setCategory(c); setShowFilter(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/[0.04] last:border-0 ${
                        category === c ? "text-secondary bg-secondary/5 font-semibold" : "text-white/55 hover:text-white hover:bg-white/5"
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

      {/* Cards */}
      <div className="container px-4 py-8 sm:py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            <p className="text-white/40 text-sm">Loading shortlisted teachers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center py-24 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white font-semibold text-lg mt-2">
              {nominations.length === 0 ? "Voting opens soon" : "No results found"}
            </p>
            <p className="text-white/35 text-sm max-w-xs">
              {nominations.length === 0
                ? "Shortlisted teachers will appear here once nominations are reviewed."
                : "Try adjusting your search or filter."}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/40 text-sm">
                <span className="text-white font-semibold">{filtered.length}</span> teacher{filtered.length !== 1 ? "s" : ""}
                {category !== "All" && <span className="text-secondary"> · {category.replace(" Award", "")}</span>}
              </p>
              {!isAuthenticated && (
                <p className="text-xs text-white/30 italic">Login to cast your vote</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((n, i) => {
                const voteCount = voteCounts[n.id] || 0;
                const votePercent = maxVotes > 0 ? Math.round((voteCount / maxVotes) * 100) : 0;
                const hasVoted = myVotes.has(n.id);
                const rank = rankMap[n.id];
                const name = n.teacher_name || n.full_name || "—";
                const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                const colors = catStyle[n.award_category] || { bg: "bg-white/5", text: "text-white/60", border: "border-white/10", bar: "bg-white/40" };

                return (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`relative rounded-2xl border overflow-hidden bg-white/[0.03] transition-all duration-300 group ${
                      hasVoted ? "border-secondary/40 shadow-xl shadow-secondary/10" : "border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    {/* Rank badge — top 3 get gold/silver/bronze */}
                    {rank <= 3 && voteCount > 0 && (
                      <div className={`absolute top-3 left-3 z-10 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12px] border ${
                        rank === 1 ? "bg-amber-400/20 border-amber-400/40 text-amber-400" :
                        rank === 2 ? "bg-slate-400/20 border-slate-400/40 text-slate-300" :
                                     "bg-orange-700/20 border-orange-700/40 text-orange-500"
                      }`}>#{rank}</div>
                    )}

                    {/* Winner / Voted badge */}
                    <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                      {n.status === "winner" && (
                        <span className="flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 rounded-full px-2 py-0.5">
                          <Trophy className="w-2.5 h-2.5 text-amber-400" />
                          <span className="text-[10px] font-bold text-amber-400">Winner</span>
                        </span>
                      )}
                      {hasVoted && (
                        <span className="flex items-center gap-1 bg-secondary/15 border border-secondary/30 rounded-full px-2 py-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-secondary" />
                          <span className="text-[10px] font-bold text-secondary">Voted</span>
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      {/* Avatar + name */}
                      <div className="flex items-start gap-3 mb-4 mt-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] flex items-center justify-center font-heading font-bold text-base text-white shadow-md flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <h3 className="font-heading font-bold text-white text-sm sm:text-base leading-tight truncate">{name}</h3>
                          <p className="text-white/45 text-xs truncate mt-0.5">{n.school_name || "—"}</p>
                        </div>
                      </div>

                      {/* Category pill */}
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border mb-4 ${colors.bg} ${colors.text} ${colors.border}`}>
                        <Award className="w-2.5 h-2.5" />
                        {n.award_category?.replace(" Award", "") || "—"}
                      </span>

                      {/* Impact quote */}
                      {(n.special_thing || n.impact_story) && (
                        <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2 italic">
                          "{n.special_thing || n.impact_story}"
                        </p>
                      )}

                      {/* Vote progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] text-white/40 font-medium">
                            {voteCount} vote{voteCount !== 1 ? "s" : ""}
                          </span>
                          <span className={`text-[11px] font-semibold ${colors.text}`}>
                            {totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${votePercent}%` }}
                            transition={{ duration: 1, delay: i * 0.05 + 0.3, ease: "easeOut" }}
                            className={`h-full rounded-full ${colors.bar}`}
                          />
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/[0.06] mb-4" />

                      {/* Actions */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: hasVoted ? 1 : 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleVote(n.id, name)}
                          disabled={voting === n.id || hasVoted}
                          className={`flex-1 h-10 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
                            hasVoted
                              ? "bg-secondary/10 border border-secondary/25 text-secondary cursor-default"
                              : "bg-gradient-to-r from-[#9B2020] to-[#7A1515] text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60"
                          }`}
                        >
                          {!hasVoted && (
                            <motion.div animate={{ x: [-200, 300] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5 }}
                              className="absolute inset-0 w-16 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />
                          )}
                          {voting === n.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : hasVoted
                            ? <><CheckCircle2 className="w-4 h-4" /> Voted</>
                            : <><ThumbsUp className="w-4 h-4" /> Vote</>
                          }
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            const text = `I voted for ${name} in the NIAT Future-Ready Educator Awards 2026! 🏆\nYou can vote too: ${window.location.href}`;
                            if (navigator.share) navigator.share({ title: "Vote for this teacher!", text, url: window.location.href });
                            else { navigator.clipboard.writeText(text); toast({ title: "Link copied!" }); }
                          }}
                          className="w-10 h-10 rounded-xl border border-white/12 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all flex-shrink-0">
                          <Share2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VotePage;

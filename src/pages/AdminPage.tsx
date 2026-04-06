import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Award, Users, TrendingUp, Download, Search,
  CheckCircle2, XCircle, Eye, BarChart3, ArrowLeft, Star,
  Loader2, RefreshCw, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { isAdminLoggedIn, adminLogout } from "./AdminLoginPage";

// Admin-only Supabase client — sends secret header so RLS allows full read/write
const adminSupabase = createClient(
  "https://hxiflxyduamfjuubdilr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aWZseHlkdWFtZmp1dWJkaWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDQzMDksImV4cCI6MjA5MDQyMDMwOX0.bgX-GSxP4gCkco5TjI80mkyO5T0ALZaDkEl7-LFhL00",
  { global: { headers: { "x-admin-secret": "niat_admin_2026_secret" } } }
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    shortlisted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    winner:      "bg-green-500/10 text-green-400 border-green-500/20",
    pending:     "bg-secondary/10 text-secondary border-secondary/20",
    rejected:    "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const AdminPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [nominations, setNominations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Guard — redirect to login if not authenticated
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin-login");
    }
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin-login");
  };

  const total = nominations.length;
  const pending = nominations.filter(n => n.status === "pending").length;
  const shortlisted = nominations.filter(n => n.status === "shortlisted").length;
  const winners = nominations.filter(n => n.status === "winner").length;

  const categoryCount = nominations.reduce((acc: Record<string, number>, n) => {
    acc[n.award_category] = (acc[n.award_category] || 0) + 1;
    return acc;
  }, {});

  const fetchNominations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("nominations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNominations(data || []);
    } catch (err: any) {
      toast({ title: "Failed to load nominations", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn()) fetchNominations();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id + status);
    try {
      const { error } = await adminSupabase.from("nominations").update({ status }).eq("id", id);
      if (error) throw error;
      setNominations(prev => prev.map(n => n.id === id ? { ...n, status } : n));
      toast({ title: `Marked as ${status}!` });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const filtered = nominations.filter(n => {
    const name = (n.teacher_name || n.full_name || "").toLowerCase();
    const school = (n.school_name || "").toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || school.includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || n.award_category === categoryFilter;
    const matchStatus = statusFilter === "All" || n.status === statusFilter;
    const matchType = typeFilter === "All" || n.type === typeFilter;
    return matchSearch && matchCategory && matchStatus && matchType;
  });

  const categories = ["All", ...Array.from(new Set(nominations.map(n => n.award_category).filter(Boolean)))];
  const topNominated = nominations[0];

  const exportCSV = () => {
    const rows = [
      ["Type", "Teacher/Applicant", "School", "Category", "Class", "Phone", "Status", "Date"],
      ...filtered.map(n => [
        n.type, n.teacher_name || n.full_name, n.school_name, n.award_category,
        n.student_class || (n.experience ? `${n.experience} yrs` : ""), n.phone, n.status,
        new Date(n.created_at).toLocaleDateString("en-IN")
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nominations.csv"; a.click();
  };

  if (!isAdminLoggedIn()) return null;

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="border-b border-primary-foreground/10 bg-foreground/50 backdrop-blur-lg sticky top-0 z-30">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-heading text-base sm:text-lg font-bold text-primary-foreground">Admin Dashboard</h1>
              <p className="text-[10px] sm:text-xs text-primary-foreground/40">Future-Ready Educator Awards 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="hero-outline" size="sm" className="gap-1.5 text-xs" onClick={fetchNominations}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="hero-outline" size="sm" className="gap-1.5 text-xs" onClick={exportCSV}>
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button variant="hero-outline" size="sm" className="gap-1.5 text-xs" onClick={handleLogout}>
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8 px-3 sm:px-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            <span className="ml-3 text-primary-foreground/60">Loading nominations...</span>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { label: "Total Nominations", value: total, icon: Users, color: "bg-primary" },
                { label: "Pending Review", value: pending, icon: Eye, color: "bg-secondary" },
                { label: "Shortlisted", value: shortlisted, icon: CheckCircle2, color: "bg-blue-600" },
                { label: "Winners", value: winners, icon: Award, color: "bg-green-600" },
              ].map((stat, i) => (
                <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary-foreground font-heading">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-primary-foreground/40 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="lg:col-span-2 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 sm:p-6">
                <h2 className="font-heading text-base sm:text-lg font-bold text-primary-foreground flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />Nominations by Category
                </h2>
                {Object.keys(categoryCount).length === 0 ? (
                  <p className="text-primary-foreground/40 text-sm text-center py-8">No nominations yet</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(categoryCount).map(([cat, count], i) => {
                      const pct = Math.round(((count as number) / total) * 100);
                      return (
                        <motion.div key={cat} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm text-primary-foreground/70 truncate max-w-[60%]">{cat}</span>
                            <span className="text-xs sm:text-sm font-semibold text-primary-foreground">{count as number} <span className="text-primary-foreground/40 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="h-2 rounded-full bg-primary-foreground/5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6 + i * 0.08, duration: 0.8 }}
                              className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary/60" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 sm:p-6 flex flex-col gap-4">
                <h2 className="font-heading text-base sm:text-lg font-bold text-primary-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />Submission Types
                </h2>
                {[
                  { label: "Student Nominations", count: nominations.filter(n => n.type === "student").length, color: "bg-primary" },
                  { label: "Teacher Self-Nominations", count: nominations.filter(n => n.type === "teacher").length, color: "bg-secondary" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs sm:text-sm text-primary-foreground/70">{item.label}</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-primary-foreground">{item.count}</span>
                  </div>
                ))}
                {topNominated && (
                  <div className="mt-2 p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-semibold text-primary-foreground">Latest Submission</span>
                    </div>
                    <p className="text-sm text-primary-foreground/60">{topNominated.teacher_name || topNominated.full_name || "—"}</p>
                    <p className="text-xs text-primary-foreground/40">{topNominated.school_name || ""} · {new Date(topNominated.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-primary-foreground/10">
                <div className="flex flex-col gap-3">
                  <h2 className="font-heading text-base sm:text-lg font-bold text-primary-foreground">
                    All Nominations <span className="text-primary-foreground/40 font-normal text-sm">({filtered.length})</span>
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[160px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/30" />
                      <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 text-sm h-9" />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-auto min-w-[130px] bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground text-xs h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c === "All" ? "All Categories" : c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-auto min-w-[110px] bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground text-xs h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["All", "pending", "shortlisted", "winner", "rejected"].map(s => (
                          <SelectItem key={s} value={s}>{s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-auto min-w-[100px] bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground text-xs h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-primary-foreground/10">
                      {["Type", "Teacher / Applicant", "School", "Category", "Class / Exp", "Phone", "Status", "Date", "Actions"].map(h => (
                        <th key={h} className="text-left text-[10px] sm:text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider px-4 sm:px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((n, i) => (
                      <motion.tr key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-primary-foreground/5 hover:bg-primary-foreground/5 transition-colors">
                        <td className="px-4 sm:px-5 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${n.type === "student" ? "bg-primary/20 text-primary-foreground" : "bg-secondary/20 text-secondary"}`}>
                            {n.type}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium text-primary-foreground max-w-[140px] truncate">{n.teacher_name || n.full_name || "—"}</td>
                        <td className="px-4 sm:px-5 py-3 text-xs text-primary-foreground/60 max-w-[130px] truncate">{n.school_name || "—"}</td>
                        <td className="px-4 sm:px-5 py-3">
                          <Badge variant="outline" className="text-[10px] border-primary-foreground/20 text-primary-foreground/60 whitespace-nowrap">
                            {n.award_category?.replace(" Award", "") || "—"}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-xs text-primary-foreground/60">{n.student_class || (n.experience ? `${n.experience} yrs` : "—")}</td>
                        <td className="px-4 sm:px-5 py-3 text-xs text-primary-foreground/60">{n.phone || "—"}</td>
                        <td className="px-4 sm:px-5 py-3"><StatusBadge status={n.status} /></td>
                        <td className="px-4 sm:px-5 py-3 text-xs text-primary-foreground/40 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 sm:px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateStatus(n.id, "shortlisted")} disabled={updating === n.id + "shortlisted" || n.status === "shortlisted"}
                              className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-400 transition-colors disabled:opacity-30" title="Shortlist">
                              {updating === n.id + "shortlisted" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => updateStatus(n.id, "winner")} disabled={updating === n.id + "winner" || n.status === "winner"}
                              className="p-1.5 rounded-md hover:bg-green-500/10 text-green-400 transition-colors disabled:opacity-30" title="Mark Winner">
                              {updating === n.id + "winner" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => updateStatus(n.id, "rejected")} disabled={updating === n.id + "rejected" || n.status === "rejected"}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-30" title="Reject">
                              {updating === n.id + "rejected" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && !loading && (
                <div className="py-16 text-center text-primary-foreground/40">
                  {nominations.length === 0 ? "No nominations yet. Share the site to get started!" : "No nominations match your filters."}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

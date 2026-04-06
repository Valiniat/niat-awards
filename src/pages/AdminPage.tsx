import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Award, Users, Vote, TrendingUp, Download, Filter, Search,
  ChevronDown, CheckCircle2, XCircle, Eye, BarChart3, MapPin,
  Calendar, ArrowLeft, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const stats = [
  { label: "Total Nominations", value: "12,487", change: "+342 this week", icon: Users, color: "bg-primary" },
  { label: "Approved", value: "8,241", change: "66% approval rate", icon: CheckCircle2, color: "bg-green-600" },
  { label: "Pending Review", value: "3,102", change: "Needs attention", icon: Eye, color: "bg-secondary" },
  { label: "Total Votes", value: "45,892", change: "+1,204 today", icon: Vote, color: "bg-blue-600" },
];

const stateData = [
  { state: "Maharashtra", nominations: 2341, votes: 8920 },
  { state: "Karnataka", nominations: 1876, votes: 7234 },
  { state: "Tamil Nadu", nominations: 1654, votes: 6891 },
  { state: "Uttar Pradesh", nominations: 1432, votes: 5673 },
  { state: "Delhi", nominations: 1198, votes: 4562 },
  { state: "Telangana", nominations: 987, votes: 3891 },
  { state: "Gujarat", nominations: 876, votes: 3245 },
  { state: "Rajasthan", nominations: 765, votes: 2987 },
];

const nominations = [
  { id: 1, teacher: "Dr. Priya Sharma", school: "DPS Bangalore", category: "Teaching Innovation", state: "Karnataka", status: "pending", votes: 234, date: "2026-03-28" },
  { id: 2, teacher: "Rajesh Kumar", school: "KV Delhi", category: "Student Transformation", state: "Delhi", status: "approved", votes: 456, date: "2026-03-27" },
  { id: 3, teacher: "Anita Desai", school: "St. Xavier's Mumbai", category: "Beyond Classroom", state: "Maharashtra", status: "approved", votes: 189, date: "2026-03-26" },
  { id: 4, teacher: "Mohammed Faiz", school: "AMU School", category: "Future Readiness", state: "Uttar Pradesh", status: "rejected", votes: 67, date: "2026-03-25" },
  { id: 5, teacher: "Lakshmi Iyer", school: "Vidya Mandir Chennai", category: "Teaching Innovation", state: "Tamil Nadu", status: "pending", votes: 312, date: "2026-03-24" },
  { id: 6, teacher: "Suresh Patel", school: "NV Ahmedabad", category: "Student Transformation", state: "Gujarat", status: "approved", votes: 278, date: "2026-03-23" },
];

const categories = ["All Categories", "Student Transformation", "Teaching Innovation", "Beyond Classroom", "Future Readiness"];
const statuses = ["All Status", "Pending", "Approved", "Rejected"];
const statesFilter = ["All States", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Delhi", "Telangana", "Gujarat", "Rajasthan"];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-secondary/10 text-secondary border-secondary/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const AdminPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [stateFilter, setStateFilter] = useState("All States");

  const filtered = nominations.filter((n) => {
    const matchSearch = n.teacher.toLowerCase().includes(search.toLowerCase()) || n.school.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All Categories" || n.category === categoryFilter;
    const matchStatus = statusFilter === "All Status" || n.status === statusFilter.toLowerCase();
    const matchState = stateFilter === "All States" || n.state === stateFilter;
    return matchSearch && matchCategory && matchStatus && matchState;
  });

  const maxNominations = Math.max(...stateData.map(s => s.nominations));

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="border-b border-primary-foreground/10 bg-foreground/50 backdrop-blur-lg sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-heading text-lg font-bold text-primary-foreground">Admin Dashboard</h1>
              <p className="text-xs text-primary-foreground/40">Future-Ready Educator Awards 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="hero-outline" size="sm" className="gap-2 text-xs">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
            <Button variant="hero" size="sm" className="text-xs">Publish Announcement</Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 hover:bg-primary-foreground/8 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-primary-foreground font-heading">{stat.value}</div>
              <div className="text-xs text-primary-foreground/40 mt-1">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* State-wise breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-2 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-bold text-primary-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" />
                State-wise Nominations
              </h2>
            </div>
            <div className="space-y-3">
              {stateData.map((s, i) => (
                <motion.div
                  key={s.state}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-28 text-sm text-primary-foreground/70 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-primary-foreground/30" />
                    {s.state}
                  </div>
                  <div className="flex-1 h-8 rounded-lg bg-primary-foreground/5 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.nominations / maxNominations) * 100}%` }}
                      transition={{ delay: 0.6 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary-foreground/60">
                      {s.nominations.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Category breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6"
          >
            <h2 className="font-heading text-lg font-bold text-primary-foreground flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-secondary" />
              By Category
            </h2>
            <div className="space-y-4">
              {[
                { name: "Student Transformation", count: 3421, pct: 28 },
                { name: "Teaching Innovation", count: 3102, pct: 25 },
                { name: "Beyond Classroom", count: 2987, pct: 24 },
                { name: "Future Readiness", count: 2977, pct: 23 },
              ].map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-primary-foreground/70">{cat.name}</span>
                    <span className="text-sm font-semibold text-primary-foreground">{cat.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary-foreground/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ delay: 0.7 + i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary/60"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-secondary" />
                <span className="text-sm font-semibold text-primary-foreground">Top Nominated</span>
              </div>
              <p className="text-sm text-primary-foreground/60">Dr. Priya Sharma</p>
              <p className="text-xs text-primary-foreground/40">DPS Bangalore · 456 votes</p>
            </div>
          </motion.div>
        </div>

        {/* Nominations Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 overflow-hidden"
        >
          <div className="p-6 border-b border-primary-foreground/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="font-heading text-lg font-bold text-primary-foreground">All Nominations</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/30" />
                  <Input
                    placeholder="Search teacher or school..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 w-60"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44 bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="w-36 bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statesFilter.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-foreground/10">
                  {["Teacher", "School", "Category", "State", "Votes", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-primary-foreground/40 uppercase tracking-wider px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((n, i) => (
                  <motion.tr
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-primary-foreground/5 hover:bg-primary-foreground/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-primary-foreground">{n.teacher}</td>
                    <td className="px-6 py-4 text-sm text-primary-foreground/60">{n.school}</td>
                    <td className="px-6 py-4"><Badge variant="outline" className="text-xs border-primary-foreground/20 text-primary-foreground/60">{n.category}</Badge></td>
                    <td className="px-6 py-4 text-sm text-primary-foreground/60">{n.state}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary-foreground">{n.votes}</td>
                    <td className="px-6 py-4"><StatusBadge status={n.status} /></td>
                    <td className="px-6 py-4 text-sm text-primary-foreground/40">{n.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-md hover:bg-green-500/10 text-green-400 transition-colors" title="Approve">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-primary-foreground/10 text-primary-foreground/50 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-primary-foreground/40">
              No nominations match your filters.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;

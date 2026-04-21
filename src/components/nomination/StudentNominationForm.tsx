import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const awardCategories = [
  "Student Transformation Award",
  "Teaching Innovation Award",
  "Beyond Classroom Impact Award",
  "Future Readiness Award",
];

const categoryGuide = [
  {
    title: "Student Transformation Award",
    icon: "⭐",
    desc: "Teacher who changed a student's life through deep mentorship, care, and personal attention.",
    bg: "bg-primary/5",
    border: "border-primary/20",
    color: "text-primary",
  },
  {
    title: "Teaching Innovation Award",
    icon: "💡",
    desc: "Teacher who uses creative, tech-driven, or fresh methods that make learning exciting.",
    bg: "bg-secondary/5",
    border: "border-secondary/20",
    color: "text-secondary",
  },
  {
    title: "Beyond Classroom Impact Award",
    icon: "🌍",
    desc: "Teacher who goes beyond the syllabus — community work, life skills, emotional support.",
    bg: "bg-primary/5",
    border: "border-primary/20",
    color: "text-primary",
  },
  {
    title: "Future Readiness Award",
    icon: "🚀",
    desc: "Teacher who prepares students for tomorrow's careers with practical, future-focused education.",
    bg: "bg-secondary/5",
    border: "border-secondary/20",
    color: "text-secondary",
  },
];

const classGroups = [
  { label: "Class 5–8", value: "5-8" },
  { label: "Class 9–10", value: "9-10" },
  { label: "Class 11–12", value: "11-12" },
];

const classOptions: Record<string, string[]> = {
  "5-8":  ["5th Class", "6th Class", "7th Class", "8th Class"],
  "9-10": ["9th Class", "10th Class"],
  "11-12":["11th Class", "12th Class"],
};

const RatingStars = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs sm:text-sm text-foreground">{label}</span>
    <div className="flex gap-0.5 sm:gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} className="p-0.5">
          <Star className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${s <= value ? "text-accent fill-accent" : "text-foreground/60/30"}`} />
        </button>
      ))}
    </div>
  </div>
);

const StudentNominationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classGroup, setClassGroup] = useState("");
  const [form, setForm] = useState({
    studentName: user?.name || "", studentClass: "", schoolName: "", phone: user?.phone || "",
    teacherName: "", awardCategory: "", specialThing: "",
    subject: "", impactStory: "", board: "",
    careRating: 0, clarityRating: 0, motivationRating: 0, supportRating: 0,
  });

  const [searchParams] = useSearchParams();

  // Pre-fill category from URL param (e.g. from CategoriesSection clicks)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setForm(p => ({ ...p, awardCategory: decodeURIComponent(cat) }));
    }
  }, []);

  const set = (key: string, val: string | number) => setForm((p) => {
    const next = { ...p, [key]: val };
    try { localStorage.setItem("niat_nomination_draft", JSON.stringify(next)); } catch {}
    return next;
  });

  // Restore draft on mount — preserve current user's phone/name to avoid cross-user leakage
  useEffect(() => {
    try {
      const draft = localStorage.getItem("niat_nomination_draft");
      if (draft) {
        const d = JSON.parse(draft);
        setForm(f => ({
          ...f,
          ...d,
          // Always use the currently logged-in user's info, never from draft
          studentName: user?.name || f.studentName,
          phone: user?.phone || f.phone,
        }));
      }
    } catch {}
  }, []);

  const handleGroupChange = (val: string) => {
    setClassGroup(val);
    set("studentClass", "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classGroup) {
      toast({ title: "Please select your class group", variant: "destructive" });
      return;
    }
    if (!form.studentClass) {
      toast({ title: "Please select your class", variant: "destructive" });
      return;
    }
    if (!form.awardCategory) {
      toast({ title: "Please select an award category", variant: "destructive" });
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      toast({ title: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    // Honeypot check — bots fill hidden fields
    const honeypot = (document.getElementById('_hp_field') as HTMLInputElement)?.value;
    if (honeypot) { navigate("/thank-you"); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from("nominations").insert({
        type: "student",
        student_name: form.studentName,
        student_class: form.studentClass,
        class_group: classGroup,
        school_name: form.schoolName,
        phone: form.phone,
        teacher_name: form.teacherName,
        award_category: form.awardCategory,
        special_thing: form.specialThing,
        subject: form.subject || null,
        impact_story: form.impactStory || null,
        board: form.board || null,
        care_rating: form.careRating || null,
        clarity_rating: form.clarityRating || null,
        motivation_rating: form.motivationRating || null,
        support_rating: form.supportRating || null,
      });
      if (error) throw error;
      localStorage.removeItem("niat_nomination_draft");
      navigate("/thank-you");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = categoryGuide.find(c => c.title === form.awardCategory);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Nominate Your Teacher</h1>
      <p className="text-foreground/60 mb-6 sm:mb-8 text-sm sm:text-base">Tell us about the teacher who inspires you</p>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Honeypot — hidden from real users, bots fill this */}
        <input id="_hp_field" name="_honeypot" type="text" defaultValue=""
          tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }} />

        {/* Class group */}
        <div>
          <Label>What class group are you in?</Label>
          <Select value={classGroup} onValueChange={handleGroupChange}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select your class group" /></SelectTrigger>
            <SelectContent>
              {classGroups.map((g) => (<SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* Specific class */}
        <AnimatePresence>
          {classGroup && (
            <motion.div key="class-select" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Label>Which class are you in?</Label>
              <Select value={form.studentClass} onValueChange={(v) => set("studentClass", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select your class" /></SelectTrigger>
                <SelectContent>
                  {classOptions[classGroup].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rest of form */}
        <AnimatePresence mode="wait">
          {classGroup && form.studentClass && (
            <motion.div key={classGroup + form.studentClass} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 sm:space-y-5">

              <div><Label>Your Name</Label><Input className="mt-1.5 h-12 text-base" value={form.studentName} onChange={(e) => set("studentName", e.target.value)} required /></div>
              <div><Label>School Name</Label><Input className="mt-1.5 h-12 text-base" value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} required /></div>
              <div><Label>Phone Number</Label><Input className="mt-1.5 h-12 text-base" type="tel" inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile number" required /></div>
              <div><Label>Teacher's Name</Label><Input className="mt-1.5 h-12 text-base" value={form.teacherName} onChange={(e) => set("teacherName", e.target.value)} required /></div>

              {/* ── Award Category with animated guide ── */}
              <div>
                <Label>Award Category</Label>
                <Select value={form.awardCategory} onValueChange={(v) => set("awardCategory", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{awardCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                </Select>

                <AnimatePresence mode="wait">
                  {/* Guide cards — shown when nothing selected */}
                  {!form.awardCategory && (
                    <motion.div
                      key="guide"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3"
                    >
                      <p className="text-xs text-foreground/60 mb-2 font-medium flex items-center gap-1.5">
                        <span>💬</span> Not sure which to pick? Tap a category below:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categoryGuide.map((cat, i) => (
                          <motion.button
                            key={cat.title}
                            type="button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.3 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => set("awardCategory", cat.title)}
                            className={`text-left p-3 rounded-xl border cursor-pointer transition-shadow hover:shadow-md ${cat.bg} ${cat.border}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">{cat.icon}</span>
                              <span className={`text-xs font-semibold leading-tight ${cat.color}`}>
                                {cat.title.replace(" Award", "")}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/60 leading-snug">{cat.desc}</p>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Selected category confirmation */}
                  {form.awardCategory && selectedCat && (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0, scale: 0.96, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className={`mt-3 p-3 rounded-xl border flex items-start gap-3 ${selectedCat.bg} ${selectedCat.border}`}
                    >
                      <span className="text-2xl">{selectedCat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${selectedCat.color} flex items-center gap-1`}>
                          <span>✓</span> {selectedCat.title}
                        </p>
                        <p className="text-xs text-foreground/60 mt-0.5 leading-snug">{selectedCat.desc}</p>
                        <button
                          type="button"
                          onClick={() => set("awardCategory", "")}
                          className="text-[10px] text-foreground/60 underline mt-1 hover:text-foreground transition-colors"
                        >
                          Change category
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div><Label>What's one special thing about this teacher?</Label><Textarea className="mt-1.5" value={form.specialThing} onChange={(e) => set("specialThing", e.target.value)} rows={3} required /></div>

              {(classGroup === "9-10" || classGroup === "11-12") && (
                <>
                  <div><Label>Subject the teacher teaches</Label><Input className="mt-1.5 h-12 text-base" value={form.subject} onChange={(e) => set("subject", e.target.value)} required /></div>
                  <div><Label>How has this teacher impacted you? (2–3 sentences)</Label><Textarea className="mt-1.5" value={form.impactStory} onChange={(e) => set("impactStory", e.target.value)} rows={4} required /></div>
                </>
              )}

              {classGroup === "11-12" && (
                <>
                  <div>
                    <Label>Board</Label>
                    <Select value={form.board} onValueChange={(v) => set("board", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select board" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                        <SelectItem value="State Board">State Board</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-card rounded-xl p-4 sm:p-5 border border-border/50 space-y-3 sm:space-y-4">
                    <p className="font-heading font-semibold text-foreground text-sm">Rate your teacher</p>
                    <RatingStars label="Care for students" value={form.careRating} onChange={(v) => set("careRating", v)} />
                    <RatingStars label="Teaching clarity" value={form.clarityRating} onChange={(v) => set("clarityRating", v)} />
                    <RatingStars label="Motivation" value={form.motivationRating} onChange={(v) => set("motivationRating", v)} />
                    <RatingStars label="Support outside class" value={form.supportRating} onChange={(v) => set("supportRating", v)} />
                  </div>
                </>
              )}

              <Button type="submit" variant="hero" size="lg" className="w-full h-14 rounded-xl text-base font-bold" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Nomination"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default StudentNominationForm;

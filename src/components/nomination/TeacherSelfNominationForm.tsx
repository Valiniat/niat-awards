import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categoryGuide = [
  { title: "Student Transformation Award", icon: "⭐", desc: "Teacher who changed a student's life through deep mentorship and personal care.", bg: "bg-primary/5", border: "border-primary/20", color: "text-primary" },
  { title: "Teaching Innovation Award", icon: "💡", desc: "Teacher who uses creative, tech-driven methods that make learning exciting.", bg: "bg-secondary/5", border: "border-secondary/20", color: "text-secondary" },
  { title: "Beyond Classroom Impact Award", icon: "🌍", desc: "Teacher who goes beyond the syllabus — community work, life skills, emotional support.", bg: "bg-primary/5", border: "border-primary/20", color: "text-primary" },
  { title: "Future Readiness Award", icon: "🚀", desc: "Teacher who prepares students for tomorrow's careers with practical, future-focused education.", bg: "bg-secondary/5", border: "border-secondary/20", color: "text-secondary" },
];

const awardCategories = [
  "Student Transformation Award",
  "Teaching Innovation Award",
  "Beyond Classroom Impact Award",
  "Future Readiness Award",
];

const TeacherSelfNominationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || "", school: "", subject: "", experience: "",
    awardCategory: "", impactStory: "", phone: user?.phone || "",
  });

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("nominations").insert({
        type: "teacher",
        full_name: form.fullName,
        school_name: form.school,
        subject: form.subject,
        experience: form.experience,
        award_category: form.awardCategory,
        impact_story: form.impactStory,
        phone: form.phone,
      });
      if (error) throw error;
      navigate("/thank-you");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">Teacher Self-Nomination</h2>
      <p className="text-muted-foreground mb-8">Share your story and showcase your impact</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div><Label>Full Name</Label><Input className="mt-1.5" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required /></div>
        <div><Label>School / College</Label><Input className="mt-1.5" value={form.school} onChange={(e) => set("school", e.target.value)} required /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Subject</Label><Input className="mt-1.5" value={form.subject} onChange={(e) => set("subject", e.target.value)} required /></div>
          <div><Label>Years of Experience</Label><Input className="mt-1.5" type="number" value={form.experience} onChange={(e) => set("experience", e.target.value)} required /></div>
        </div>
        <div>
          <Label>Award Category</Label>
          <Select value={form.awardCategory} onValueChange={(v) => set("awardCategory", v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{awardCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
          </Select>

          <AnimatePresence mode="wait">
            {!form.awardCategory && (
              <motion.div
                key="guide"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="mt-3"
              >
                <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
                  <span>💬</span> Which category best describes your impact? Tap to select:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoryGuide.map((cat, i) => (
                    <motion.button
                      key={cat.title}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
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
                      <p className="text-xs text-muted-foreground leading-snug">{cat.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {form.awardCategory && (
              <motion.div
                key="selected"
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`mt-3 p-3 rounded-xl border flex items-start gap-3 ${categoryGuide.find(c => c.title === form.awardCategory)?.bg} ${categoryGuide.find(c => c.title === form.awardCategory)?.border}`}
              >
                <span className="text-2xl">{categoryGuide.find(c => c.title === form.awardCategory)?.icon}</span>
                <div>
                  <p className={`text-xs font-semibold ${categoryGuide.find(c => c.title === form.awardCategory)?.color}`}>
                    ✓ {form.awardCategory}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {categoryGuide.find(c => c.title === form.awardCategory)?.desc}
                  </p>
                  <button type="button" onClick={() => set("awardCategory", "")}
                    className="text-[10px] text-muted-foreground underline mt-1 hover:text-foreground transition-colors">
                    Change category
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div><Label>Your Impact Story</Label><Textarea className="mt-1.5" value={form.impactStory} onChange={(e) => set("impactStory", e.target.value)} rows={5} placeholder="Describe how you've made a difference in your students' lives..." required /></div>
        <div>
          <Label>Supporting Documents (optional)</Label>
          <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-secondary/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload or drag files here</p>
            <p className="text-xs text-muted-foreground/70 mt-1">PDF, images up to 10MB</p>
          </div>
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full py-6 rounded-xl text-base" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Application"}
        </Button>
      </form>
    </motion.div>
  );
};

export default TeacherSelfNominationForm;

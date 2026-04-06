import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const classGroups = [
  { label: "Class 5–8", value: "5-8" },
  { label: "Class 9–10", value: "9-10" },
  { label: "Class 11–12", value: "11-12" },
];

const RatingStars = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-sm text-foreground">{label}</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star className={`w-5 h-5 transition-colors ${s <= value ? "text-accent fill-accent" : "text-muted-foreground/30"}`} />
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

  const set = (key: string, val: string | number) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      navigate("/thank-you");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">Nominate Your Teacher</h2>
      <p className="text-muted-foreground mb-8">Tell us about the teacher who inspires you</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>What class are you in?</Label>
          <Select value={classGroup} onValueChange={setClassGroup}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select your class group" /></SelectTrigger>
            <SelectContent>
              {classGroups.map((g) => (<SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <AnimatePresence mode="wait">
          {classGroup && (
            <motion.div key={classGroup} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Your Name</Label><Input className="mt-1.5" value={form.studentName} onChange={(e) => set("studentName", e.target.value)} required /></div>
                <div><Label>Class</Label><Input className="mt-1.5" value={form.studentClass} onChange={(e) => set("studentClass", e.target.value)} placeholder="e.g. 7th" required /></div>
              </div>
              <div><Label>School Name</Label><Input className="mt-1.5" value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} required /></div>
              <div><Label>Phone Number</Label><Input className="mt-1.5" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" required /></div>
              <div><Label>Teacher's Name</Label><Input className="mt-1.5" value={form.teacherName} onChange={(e) => set("teacherName", e.target.value)} required /></div>
              <div>
                <Label>Award Category</Label>
                <Select value={form.awardCategory} onValueChange={(v) => set("awardCategory", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{awardCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>What's one special thing about this teacher?</Label><Textarea className="mt-1.5" value={form.specialThing} onChange={(e) => set("specialThing", e.target.value)} rows={3} required /></div>
              {(classGroup === "9-10" || classGroup === "11-12") && (
                <>
                  <div><Label>Subject the teacher teaches</Label><Input className="mt-1.5" value={form.subject} onChange={(e) => set("subject", e.target.value)} required /></div>
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
                  <div className="bg-card rounded-xl p-5 border border-border/50 space-y-4">
                    <p className="font-heading font-semibold text-foreground text-sm">Rate your teacher</p>
                    <RatingStars label="Care for students" value={form.careRating} onChange={(v) => set("careRating", v)} />
                    <RatingStars label="Teaching clarity" value={form.clarityRating} onChange={(v) => set("clarityRating", v)} />
                    <RatingStars label="Motivation" value={form.motivationRating} onChange={(v) => set("motivationRating", v)} />
                    <RatingStars label="Support outside class" value={form.supportRating} onChange={(v) => set("supportRating", v)} />
                  </div>
                </>
              )}
              <Button type="submit" variant="hero" size="lg" className="w-full py-6 rounded-xl text-base" disabled={loading}>
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

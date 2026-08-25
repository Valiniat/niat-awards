import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, Calendar, Sparkles, User, Phone, Loader2, CheckCircle2, ChevronDown, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ── Countdown target: Sep 3, 2026 ──
const DEADLINE = new Date("2026-09-03T23:59:59");

const useCountdown = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, DEADLINE.getTime() - now.getTime());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
};

const CountdownBox = ({ value, label, delay }: { value: number; label: string; delay: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
    className="flex flex-col items-center">
    <div className="relative w-14 h-14 sm:w-16 sm:h-16">
      <div className="absolute inset-0 rounded-xl bg-secondary/25 blur-md" />
      <div className="relative w-full h-full rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg">
        <AnimatePresence mode="popLayout">
          <motion.span key={value} initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.18 }} className="font-heading text-2xl sm:text-3xl font-bold text-white">
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
    <span className="text-[10px] text-white/70 mt-1.5 uppercase tracking-widest font-semibold">{label}</span>
  </motion.div>
);

const Field = ({ label, icon: Icon, prefix, value, onChange, onKeyDown, placeholder, type = "text", inputMode, maxLength, autoFocus }: any) => (
  <div>
    <label className="block text-[12px] font-semibold text-white/80 mb-1.5 uppercase tracking-wider">{label}</label>
    <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-white/25 bg-white/10 focus-within:border-secondary/70 focus-within:bg-white/15 transition-all duration-200">
      {prefix && (
        <div className="px-3.5 flex items-center self-stretch border-r border-white/15 bg-white/5 flex-shrink-0">
          <span className="text-[14px] font-bold text-white/80">{prefix}</span>
        </div>
      )}
      {Icon && !prefix && (
        <div className="pl-3.5 flex items-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white/50" />
        </div>
      )}
      <input value={value} onChange={onChange} onKeyDown={onKeyDown} type={type} inputMode={inputMode}
        maxLength={maxLength} autoFocus={autoFocus} placeholder={placeholder}
        className="flex-1 h-12 px-3.5 bg-transparent text-white text-[15px] font-medium placeholder:text-white/35 focus:outline-none" />
    </div>
  </div>
);

// ── Inline Nomination Form (shown after OTP verify) ──
// Defined outside form so it never re-mounts on parent re-render
const CustomSelect = ({ value, onChange, options, placeholder, required }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; required?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full h-10 rounded-lg px-3 flex items-center justify-between text-[13px] font-medium transition-all focus:outline-none"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: value ? "#fff" : "rgba(255,255,255,0.4)" }}>
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 ml-2 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-auto z-[100] shadow-2xl"
          style={{ background: "#1a0505", border: "1px solid rgba(255,255,255,0.15)", maxHeight: "180px" }}>
          {options.map(o => (
            <button key={o} type="button"
              onClick={() => { onChange(o); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[12px] transition-colors border-b border-white/5 last:border-0"
              style={{ color: value === o ? "#d97706" : "#fff", background: value === o ? "rgba(217,119,6,0.1)" : "transparent" }}>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InlineNominationForm = ({ userName, userPhone, onClose }: { userName: string; userPhone: string; onClose: () => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<"" | "student" | "teacher">("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const [sf, setSf] = useState({
    studentName: userName, currentEducation: "", schoolName: "",
    teacherName: "", teacherPhone: "", teachingSubject: "",
    specialThing: "", impactStory: "", awardsRecognition: "", teacherSocial: "",
  });
  const [tf, setTf] = useState({
    fullName: userName, school: "", subject: "", experience: "",
    classesTeaching: "", impactStory: "", phone: userPhone,
  });

  const setSField = (k: string, v: string) => setSf(p => ({ ...p, [k]: v }));
  const setTField = (k: string, v: string) => setTf(p => ({ ...p, [k]: v }));

  const educationOptions = [
    "School – Class 1 to 5", "School – Class 6 to 8",
    "School – Class 9 to 10", "School – Class 11 to 12",
    "Diploma / ITI", "Undergraduate (B.Tech / B.Com / BA / B.Sc etc.)",
    "Postgraduate", "Other",
  ];
  const classesTeaching = [
    "Primary (Class 1–5)", "Middle School (Class 6–8)",
    "High School (Class 9–10)", "Senior Secondary (Class 11–12)",
    "Undergraduate / College", "Postgraduate / College", "All Classes",
  ];

  const iStyle = { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" };
  const iCls = "w-full h-10 rounded-lg px-3 text-[13px] font-medium text-white placeholder:text-white/35 focus:outline-none transition-all";

  // SelectF replaced by CustomSelect defined outside this component
  const TA = ({ label, value, onChange, placeholder, required, rows = 3 }: any) => (
    <div>
      {label && <label className="block text-[12px] font-semibold text-white/80 mb-1.5 uppercase tracking-wider">{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} required={required}
        className="w-full rounded-lg px-3 py-2 text-[13px] font-medium text-white placeholder:text-white/35 focus:outline-none transition-all resize-none"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }} />
    </div>
  );

  // Step 1 validation before going to step 2
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { toast({ title: "Please select Student or Teacher", variant: "destructive" }); return; }
    if (role === "student") {
      if (!sf.currentEducation) { toast({ title: "Please select your current education", variant: "destructive" }); return; }
      if (!sf.schoolName.trim()) { toast({ title: "Please enter school / college name", variant: "destructive" }); return; }
      if (!sf.teacherName.trim()) { toast({ title: "Please enter the teacher's name", variant: "destructive" }); return; }
      if (sf.teacherPhone.replace(/\D/g, "").length < 10) { toast({ title: "Please enter a valid teacher phone number", variant: "destructive" }); return; }
      if (!sf.teachingSubject.trim()) { toast({ title: "Please enter the teaching subject", variant: "destructive" }); return; }
    } else {
      if (!tf.school.trim()) { toast({ title: "Please enter school / college name", variant: "destructive" }); return; }
      if (tf.phone.replace(/\D/g, "").length < 10) { toast({ title: "Please enter a valid phone number", variant: "destructive" }); return; }
      if (!tf.subject.trim()) { toast({ title: "Please enter your subject", variant: "destructive" }); return; }
      if (!tf.experience) { toast({ title: "Please enter years of experience", variant: "destructive" }); return; }
      if (!tf.classesTeaching) { toast({ title: "Please select which class you teach", variant: "destructive" }); return; }
    }
    setFormStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === "student") {
        if (!sf.specialThing.trim()) throw new Error("Please fill in what's special about this teacher");
        if (!sf.impactStory.trim()) throw new Error("Please describe their impact");
        const { error } = await supabase.from("nominations").insert({
          type: "student",
          student_name: sf.studentName.trim(),
          student_class: sf.currentEducation,
          school_name: sf.schoolName.trim(),
          phone: sf.teacherPhone.trim(),
          teacher_name: sf.teacherName.trim(),
          award_category: "General Nomination",
          special_thing: sf.specialThing.trim(),
          subject: sf.teachingSubject.trim() || null,
          impact_story: sf.impactStory.trim() || null,
          board: sf.awardsRecognition.trim() || null,
        });
        if (error) throw error;
      } else {
        if (!tf.impactStory.trim()) throw new Error("Please share your impact story");
        const { error } = await supabase.from("nominations").insert({
          type: "teacher",
          full_name: tf.fullName.trim(),
          school_name: tf.school.trim(),
          subject: tf.subject.trim(),
          experience: tf.experience,
          student_class: tf.classesTeaching,
          impact_story: tf.impactStory.trim(),
          phone: tf.phone.trim(),
          award_category: "General Nomination",
        });
        if (error) throw error;
      }
      navigate("/thank-you");
    } catch (err: any) {
      toast({ title: err.message || "Submission failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl"
      style={{ background: "rgba(10,3,3,0.95)", border: "1.5px solid rgba(255,255,255,0.2)", backdropFilter: "blur(28px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent, #d97706, transparent)" }} />
      <div className="p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#8B1A1A,#6B1212)" }}>
              {userName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-white font-bold text-[13px]">Hey {userName.split(" ")[0]}! 👋</p>
              <p className="text-white/45 text-[10px]">Step {formStep} of 2 — {formStep === 1 ? "Basic Details" : "Tell Us More"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Step indicator */}
            <div className="flex gap-1">
              {[1,2].map(s => (
                <div key={s} className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: formStep === s ? "20px" : "8px", background: formStep >= s ? "#d97706" : "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1 ── */}
          {formStep === 1 && (
            <motion.form key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              onSubmit={handleStep1Next} className="space-y-2">

              {/* Role dropdown */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-white/60 mb-1 uppercase tracking-wider">I am a</label>
                <button type="button" onClick={() => setRoleOpen(!roleOpen)}
                  className="w-full h-12 rounded-xl px-4 flex items-center justify-between text-[14px] font-medium transition-all"
                  style={{ ...iStyle, color: role ? "#fff" : "rgba(255,255,255,0.35)" }}>
                  <span>{role === "student" ? "🎓 Student / Parent" : role === "teacher" ? "👩‍🏫 Teacher (Self-Nomination)" : "Select your role..."}</span>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${roleOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {roleOpen && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                      style={{ background: "#1a0505", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
                      {[
                        { val: "student", label: "🎓 Student / Parent", desc: "Nominate your teacher" },
                        { val: "teacher", label: "👩‍🏫 Teacher", desc: "Self-nomination" },
                      ].map(opt => (
                        <button key={opt.val} type="button"
                          onClick={() => { setRole(opt.val as any); setRoleOpen(false); setFormStep(1); }}
                          className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-white font-semibold text-[13px]">{opt.label}</p>
                            <p className="text-white/40 text-[11px]">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Student Step 1 fields */}
              {role === "student" && (
                <div className="space-y-2">
                  <input style={iStyle} className={iCls} placeholder="Your Full Name" required value={sf.studentName} onChange={e => setSField("studentName", e.target.value)} />
                  <CustomSelect value={sf.currentEducation} onChange={(v) => setSField("currentEducation", v)} options={educationOptions} placeholder="Current Education Level" required />
                  <input style={iStyle} className={iCls} placeholder="School / College Name" required value={sf.schoolName} onChange={e => setSField("schoolName", e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <input style={iStyle} className={iCls} placeholder="Teacher's Name" required value={sf.teacherName} onChange={e => setSField("teacherName", e.target.value)} />
                    <input style={iStyle} className={iCls} placeholder="Teacher's Phone" type="tel" inputMode="numeric" required value={sf.teacherPhone} onChange={e => setSField("teacherPhone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                  </div>
                  <input style={iStyle} className={iCls} placeholder="Teaching Subject" required value={sf.teachingSubject} onChange={e => setSField("teachingSubject", e.target.value)} />
                </div>
              )}
              {role === "teacher" && (
                <div className="space-y-2">
                  <input style={iStyle} className={iCls} placeholder="Your Full Name" required value={tf.fullName} onChange={e => setTField("fullName", e.target.value)} />
                  <input style={iStyle} className={iCls} placeholder="School / College Name" required value={tf.school} onChange={e => setTField("school", e.target.value)} />
                  <input style={iStyle} className={iCls} placeholder="+91 Phone Number" type="tel" inputMode="numeric" required value={tf.phone} onChange={e => setTField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                  <div className="grid grid-cols-2 gap-2">
                    <input style={iStyle} className={iCls} placeholder="Subject" required value={tf.subject} onChange={e => setTField("subject", e.target.value)} />
                    <input style={iStyle} className={iCls} placeholder="Years of Exp." type="number" min="0" max="50" required value={tf.experience} onChange={e => setTField("experience", e.target.value)} />
                  </div>
                  <CustomSelect value={tf.classesTeaching} onChange={(v) => setTField("classesTeaching", v)} options={classesTeaching} placeholder="Which Class Are You Teaching?" required />
                </div>
              )}

              {role && (
                <button type="submit"
                  className="w-full h-10 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 mt-1"
                  style={{ background: "linear-gradient(135deg,#9B2020,#7A1515)", color: "#fff", boxShadow: "0 4px 16px rgba(107,18,18,0.5)" }}>
                  Next — Tell Us More <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.form>
          )}

          {/* ── STEP 2 ── */}
          {formStep === 2 && (
            <motion.form key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              onSubmit={handleSubmit} className="space-y-2">

              {role === "student" && (
                <div className="space-y-2">
                  <TA label="What's special about this teacher?" value={sf.specialThing} onChange={(v: string) => setSField("specialThing", v)} placeholder="One special thing about them..." required rows={2} />
                  <TA label="How have they impacted you?" value={sf.impactStory} onChange={(v: string) => setSField("impactStory", v)} placeholder="Write 2–3 sentences about their impact..." required rows={3} />
                  <input style={iStyle} className={iCls} placeholder="Awards / Recognition (Optional)" value={sf.awardsRecognition} onChange={e => setSField("awardsRecognition", e.target.value)} />
                  <input style={iStyle} className={iCls} placeholder="Teacher's LinkedIn / Social Media (Optional)" value={sf.teacherSocial} onChange={e => setSField("teacherSocial", e.target.value)} />
                </div>
              )}
              {role === "teacher" && (
                <div className="space-y-2">
                  <TA label="Your Impact Story (2–3 sentences)" value={tf.impactStory} onChange={(v: string) => setTField("impactStory", v)} placeholder="How have you made a difference in students' lives..." required rows={4} />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setFormStep(1)}
                  className="h-10 px-4 rounded-lg font-semibold text-[13px] flex items-center gap-1 text-white/60 hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <ChevronDown className="w-3.5 h-3.5 rotate-90" /> Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 h-10 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#9B2020,#7A1515)", color: "#fff", boxShadow: "0 4px 16px rgba(107,18,18,0.5)" }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> Submit Nomination</>}
                </button>
              </div>
            </motion.form>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Quick Login Card ──
const QuickNominateCard = () => {
  const { isAuthenticated, user, sendOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "otp" | "nominate">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, go straight to nomination form
  useEffect(() => {
    if (isAuthenticated) setStep("nominate");
  }, [isAuthenticated]);

  const handleSend = async () => {
    if (!name.trim()) { toast({ title: "Please enter your name", variant: "destructive" }); return; }
    if (phone.replace(/\D/g, "").length < 10) { toast({ title: "Enter a valid 10-digit number", variant: "destructive" }); return; }
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (result.success) setStep("otp");
    else toast({ title: result.error || "Failed to send OTP", variant: "destructive" });
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    const ok = await verifyOtp(otp, name.trim());
    setLoading(false);
    if (ok) {
      setStep("nominate");
    } else {
      toast({ title: "Invalid OTP. Please try again.", variant: "destructive" });
      setOtp("");
    }
  };

  // Show inline nomination form after OTP verified
  if (step === "nominate") {
    return (
      <InlineNominationForm
        userName={user?.name || name}
        userPhone={user?.phone || phone}
        onClose={() => setStep("form")}
      />
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden"
      style={{ background: "rgba(10,3,3,0.88)", border: "1.5px solid rgba(255,255,255,0.2)", backdropFilter: "blur(28px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}>
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent, #d97706, transparent)" }} />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <img src="/niat-logo-tight.webp" alt="NIAT" className="w-9 h-11 object-contain flex-shrink-0" />
          <div>
            <p className="font-heading font-bold text-white text-[16px] leading-tight">Nominate Your Teacher</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <p className="text-[11px] text-white/55">Free · Open across India · 3 mins</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div key="form" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }} className="space-y-3.5">
              <Field label="Your Full Name" icon={User} value={name}
                onChange={(e: any) => setName(e.target.value)}
                onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
                placeholder="e.g. Rahul Sharma" autoFocus />
              <Field label="Mobile Number" prefix="+91" value={phone}
                onChange={(e: any) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
                type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                id="btn-hero-send-otp" onClick={handleSend} disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-60 mt-1"
                style={{ background: "linear-gradient(135deg, #9B2020, #7A1515)", color: "#fff", boxShadow: "0 4px 20px rgba(107,18,18,0.5)" }}>
                <motion.div animate={{ x: [-200, 400] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                  className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Phone className="w-4 h-4" /> Get OTP &amp; Nominate</>}
              </motion.button>
              <p className="text-center text-[11px] text-white/30 pt-0.5">
                By continuing you agree to our <a href="https://www.ccbp.in/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-white/50 underline">Terms</a> &amp; <a href="https://www.ccbp.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/50 underline">Privacy Policy</a>
              </p>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }} className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: "rgba(34,197,94,0.15)" }}>
                  {name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white">Hey {name.split(" ")[0]}!</p>
                  <p className="text-[11px] text-white/55 truncate">OTP sent to +91 {phone}</p>
                </div>
                <button id="btn-hero-otp-back" onClick={() => { setStep("form"); setOtp(""); }}
                  className="text-[11px] font-semibold text-secondary hover:text-secondary/80 flex-shrink-0">Edit</button>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-white/80 mb-1.5 uppercase tracking-wider">Enter 6-Digit OTP</label>
                <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                  type="tel" inputMode="numeric" maxLength={6} autoFocus
                  placeholder="· · · · · ·"
                  className="w-full h-14 rounded-xl text-center text-2xl font-bold tracking-[0.6em] text-white placeholder:text-white/20 focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.25)" }}
                  onFocus={e => e.target.style.borderColor = "rgba(217,119,6,0.7)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.25)"} />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                id="btn-hero-verify-otp" onClick={handleVerify} disabled={loading || otp.length < 6}
                className="w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #9B2020, #7A1515)", color: "#fff", boxShadow: "0 4px 20px rgba(107,18,18,0.4)" }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Verify &amp; Continue</>}
              </motion.button>
              <button id="btn-hero-resend-otp" onClick={handleSend}
                className="w-full text-center text-[12px] text-white/35 hover:text-secondary transition-colors py-1">
                Didn't receive OTP? Resend
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const countdown = useCountdown();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <>
      <section ref={sectionRef} className="relative min-h-screen flex items-center pt-[56px]"
        style={{ background: "linear-gradient(135deg, hsl(0,0%,6%), hsl(0,12%,10%))" }}>

        <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.32, 0.2] }} transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary rounded-full blur-[130px]" />
          <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-primary/70 rounded-full blur-[150px]" />
          <motion.div animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
        </motion.div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-secondary/50"
              style={{ left: `${10 + i * 9}%`, top: `${20 + (i % 4) * 20}%` }}
              animate={{ y: [-15, -45, -15], opacity: [0, 0.8, 0], scale: [0, 1.2, 0] }}
              transition={{ duration: 3 + (i % 3), delay: i * 0.5, repeat: Infinity }} />
          ))}
        </div>

        <div className="w-full relative z-10 py-10 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
                style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.25)" }}>
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-bold text-secondary tracking-widest uppercase">NIAT Presents · 2026</span>
              </motion.div>

              <div className="overflow-hidden mb-5">
                <motion.h1 initial={{ y: 80 }} animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05]">
                  India's{" "}
                  <span className="relative inline-block">
                    <span className="text-secondary">Future-Ready</span>
                    <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 }} style={{ originX: 0 }}
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary to-secondary/30 rounded-full" />
                  </span>
                  <br />Educator Awards
                </motion.h1>
              </div>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-base sm:text-lg text-white/80 max-w-lg mb-2 leading-relaxed">
                For the teachers who build futures, not just scores.
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="text-sm text-white/55 max-w-lg mb-8">
                Nominate the educator who changed your life.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                className="flex flex-wrap gap-2">
                {[
                  { label: "Nominations", date: "Till Sep 3", color: "rgba(217,119,6,0.15)", border: "rgba(217,119,6,0.35)", text: "#d97706" },
                ].map(t => (
                  <span key={t.label} className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
                    style={{ background: t.color, border: `1px solid ${t.border}`, color: t.text }}>
                    {t.label} <span style={{ opacity: 0.5 }}>·</span> <span style={{ opacity: 0.85 }}>{t.date}</span>
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-5 overflow-visible">

              <div className="w-full text-center">
                <p className="text-[11px] uppercase tracking-[0.25em] font-bold mb-4 text-secondary">
                  Nominations Close In
                </p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <CountdownBox value={countdown.days}    label="Days"  delay={0.7} />
                  <span className="text-3xl text-white/50 font-light mb-5">:</span>
                  <CountdownBox value={countdown.hours}   label="Hours" delay={0.8} />
                  <span className="text-3xl text-white/50 font-light mb-5">:</span>
                  <CountdownBox value={countdown.minutes} label="Mins"  delay={0.9} />
                  <span className="text-3xl text-white/50 font-light mb-5">:</span>
                  <CountdownBox value={countdown.seconds} label="Secs"  delay={1.0} />
                </div>
              </div>

              <div className="w-full">
                <QuickNominateCard />
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)" }}>
                <Calendar className="w-4 h-4 text-secondary" />
                <span className="text-sm text-white font-semibold">Nominations close 3 September 2026</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;

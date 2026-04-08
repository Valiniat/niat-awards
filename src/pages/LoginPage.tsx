import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, Shield, Award, ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendOtp, verifyOtp, setUserName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  const handleSendOtp = async () => {
    if (phone.length < 10) { toast.error("Please enter a valid 10-digit phone number"); return; }
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (result.success) { setStep("otp"); toast.success("OTP sent! Check your SMS."); }
    else toast.error(result.error || "Failed to send OTP.");
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    const success = await verifyOtp(otp);
    setLoading(false);
    if (success) { setStep("name"); }
    else { toast.error("Invalid OTP. Please try again."); setOtp(""); }
  };

  const handleComplete = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    setUserName(name.trim());
    toast.success(`Welcome, ${name.trim()}!`);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] flex items-center justify-center mx-auto mb-4 ring-1 ring-white/10">
            <img src="/niat-logo.png" alt="NIAT" className="w-9 h-9 object-contain" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Welcome</h1>
          <p className="text-sm text-white/50 mt-1">Sign in to India's Future-Ready Educator Awards</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {["phone", "otp", "name"].map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
              step === s ? "w-6 bg-secondary" :
              ["phone", "otp", "name"].indexOf(step) > i ? "w-3 bg-secondary/50" : "w-3 bg-white/10"
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
          <AnimatePresence mode="wait">

            {/* Step 1: Phone */}
            {step === "phone" && (
              <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-white">Enter your phone number</h2>
                </div>
                <p className="text-sm text-white/50 mb-6">We'll send an OTP to verify your number</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-1.5 block">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm font-medium">+91</div>
                      <Input type="tel" placeholder="Enter 10-digit number" value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 text-lg tracking-wider"
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()} />
                    </div>
                  </div>
                  <Button variant="hero" className="w-full py-6 text-base gap-2" onClick={handleSendOtp} disabled={phone.length < 10 || loading}>
                    {loading ? "Sending..." : "Send OTP"} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: OTP */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button onClick={() => { setStep("phone"); setOtp(""); }} className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors mb-4">
                  <ChevronLeft className="w-4 h-4" /> Change number
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-white">Verify OTP</h2>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-6 mt-2">
                  <Phone className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                  <span className="text-sm text-white/60">Code sent to <span className="text-white font-semibold">+91 {phone}</span></span>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0,1,2,3,4,5].map(i => (
                          <InputOTPSlot key={i} index={i} className="w-12 h-14 text-xl bg-white/5 border-white/15 text-white" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button variant="hero" className="w-full py-6 text-base gap-2" onClick={handleVerifyOtp} disabled={otp.length < 6 || loading}>
                    {loading ? "Verifying..." : "Verify & Continue"} <ArrowRight className="w-4 h-4" />
                  </Button>
                  <button onClick={handleSendOtp} className="w-full text-center text-sm text-white/30 hover:text-secondary transition-colors">
                    Didn't receive? Resend OTP
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Name */}
            {step === "name" && (
              <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-white">What's your name?</h2>
                </div>

                {/* Verified phone badge */}
                <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3.5 py-2.5 mt-3 mb-5">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-400">Phone verified</p>
                    <p className="text-xs text-white/40">+91 {phone}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-white mb-1.5 block">
                      Full Name <span className="text-secondary">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleComplete()}
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/25 text-base font-medium h-12"
                    />
                    <p className="text-xs text-white/40 mt-1.5">This name will appear on your nomination</p>
                  </div>
                  <Button variant="hero" className="w-full py-6 text-base gap-2" onClick={handleComplete} disabled={!name.trim()}>
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

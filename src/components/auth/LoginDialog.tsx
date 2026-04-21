import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, Shield, Users, UserCheck, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Step = "phone" | "otp" | "role";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole?: "student" | "teacher";
}

const LoginDialog = ({ open, onOpenChange, defaultRole }: LoginDialogProps) => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  // FIX: collect name on the PHONE step so it's available when verifyOtp is called
  const { sendOtp, verifyOtp, setUserRole, setUserName } = useAuth();
  const navigate = useNavigate();

  const resetState = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setName("");
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name first");
      return;
    }
    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (result.success) {
      setStep("otp");
      toast.success("OTP sent! Check your SMS.");
    } else {
      toast.error(result.error || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    // FIX: pass name here — it's collected on the phone step now
    const success = await verifyOtp(otp, name.trim());
    setLoading(false);
    if (success) {
      toast.success("Verified!");
      setStep("role");
    } else {
      toast.error("Invalid OTP. Please try again.");
      setOtp("");
    }
  };

  const handleComplete = (role: "student" | "teacher") => {
    // FIX: use setUserRole only — name already set atomically in verifyOtp
    // setUserRole + setUserName sequentially had a React batching bug where
    // both read stale state and the role update was lost
    setUserRole(role);
    onOpenChange(false);
    resetState();
    if (role === "student") {
      navigate("/nominate?type=student");
    } else {
      navigate("/nominate?type=self");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetState(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-card border-border overflow-hidden">
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">Login to Continue</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Verify your phone number to start your nomination</p>

                <div className="space-y-4">
                  {/* FIX: collect name on this step so it's ready for verifyOtp */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Your Full Name</label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-lg bg-muted border border-border text-muted-foreground text-sm">+91</div>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="text-lg tracking-wider"
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      />
                    </div>
                  </div>

                  <Button variant="hero" className="w-full py-6 text-base gap-2"
                    onClick={handleSendOtp} disabled={phone.length < 10 || !name.trim() || loading}>
                    {loading ? "Sending..." : "Send OTP"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button id="btn-dialog-otp-back" onClick={() => { setStep("phone"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                  <ChevronLeft className="w-4 h-4" /> Change number
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">Verify OTP</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Enter the 6-digit code sent to +91 {phone}</p>

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} className="w-12 h-14 text-xl" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button variant="hero" className="w-full py-6 text-base gap-2"
                    onClick={handleVerifyOtp} disabled={otp.length < 6 || loading}>
                    {loading ? "Verifying..." : "Verify"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <button id="btn-dialog-resend-otp" onClick={handleSendOtp}
                    className="w-full text-center text-sm text-muted-foreground hover:text-secondary transition-colors">
                    Didn't receive? Resend OTP
                  </button>
                </div>
              </motion.div>
            )}

            {step === "role" && (
              <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-1">
                  Welcome, {name.split(" ")[0]}! 👋
                </h2>
                <p className="text-sm text-muted-foreground mb-4">I am a...</p>

                <div className="flex items-center gap-2.5 bg-green-500/8 border border-green-500/20 rounded-lg px-3.5 py-2.5 mb-5">
                  <div className="w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600">Phone verified</p>
                    <p className="text-xs text-muted-foreground">+91 {phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button id="btn-dialog-role-student" onClick={() => handleComplete("student")}
                    className="rounded-xl border border-border bg-card p-5 text-left hover:border-secondary hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Student / Parent</p>
                    <p className="text-xs text-muted-foreground mt-1">Nominate a teacher</p>
                  </button>

                  <button id="btn-dialog-role-teacher" onClick={() => handleComplete("teacher")}
                    className="rounded-xl border border-border bg-card p-5 text-left hover:border-accent hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-5 h-5 text-accent" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Teacher</p>
                    <p className="text-xs text-muted-foreground mt-1">Self-nominate</p>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;

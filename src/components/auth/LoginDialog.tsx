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
    const success = await verifyOtp(otp);
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
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setUserRole(role);
    setUserName(name);
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
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">Login to Continue</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Verify your phone number to start your nomination
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-lg bg-muted border border-border text-muted-foreground text-sm">
                        +91
                      </div>
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="text-lg tracking-wider"
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    className="w-full py-6 text-base gap-2"
                    onClick={handleSendOtp}
                    disabled={phone.length < 10 || loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => { setStep("phone"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Change number
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">Verify OTP</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter the 6-digit code sent to +91 {phone}
                </p>

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

                  <Button
                    variant="hero"
                    className="w-full py-6 text-base gap-2"
                    onClick={handleVerifyOtp}
                    disabled={otp.length < 6 || loading}
                  >
                    {loading ? "Verifying..." : "Verify"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <button
                    onClick={handleSendOtp}
                    className="w-full text-center text-sm text-muted-foreground hover:text-secondary transition-colors"
                  >
                    Didn't receive? Resend OTP
                  </button>
                </div>
              </motion.div>
            )}

            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-heading text-lg font-semibold text-foreground mb-1">Almost there!</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Tell us your name and role to continue
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Your Full Name</label>
                    <Input
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <p className="text-sm font-medium text-foreground">I am a...</p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleComplete("student")}
                      className="rounded-xl border border-border bg-card p-5 text-left hover:border-secondary hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5 text-secondary" />
                      </div>
                      <p className="font-semibold text-foreground text-sm">Student / Parent</p>
                      <p className="text-xs text-muted-foreground mt-1">Nominate a teacher</p>
                    </button>

                    <button
                      onClick={() => handleComplete("teacher")}
                      className="rounded-xl border border-border bg-card p-5 text-left hover:border-accent hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-5 h-5 text-accent" />
                      </div>
                      <p className="font-semibold text-foreground text-sm">Teacher</p>
                      <p className="text-xs text-muted-foreground mt-1">Self-nominate</p>
                    </button>
                  </div>
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

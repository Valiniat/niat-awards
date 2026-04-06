import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, Shield, Award, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    const success = await sendOtp(phone);
    setLoading(false);
    if (success) {
      setStep("otp");
      toast.success("OTP sent! Use 000000 as the code.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    const success = await verifyOtp(otp);
    setLoading(false);
    if (success) {
      toast.success("Login successful!");
      navigate(from, { replace: true });
    } else {
      toast.error("Invalid OTP. Please try again.");
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 border border-primary-foreground/20">
            <Award className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-primary-foreground">Welcome Back</h1>
          <p className="text-sm text-primary-foreground/50 mt-1">Sign in to India's Future-Ready Educator Awards</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-sm p-8">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Phone className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-primary-foreground">Enter your phone number</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-primary-foreground/60 mb-1.5 block">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground/70 text-sm">
                        +91
                      </div>
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 text-lg tracking-wider"
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
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
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => { setStep("phone"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Change number
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-primary-foreground">Verify OTP</h2>
                </div>
                <p className="text-sm text-primary-foreground/50 mb-6">
                  Enter the 6-digit code sent to +91 {phone}
                </p>

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="w-12 h-14 text-xl bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground"
                          />
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
                    {loading ? "Verifying..." : "Verify & Login"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <button
                    onClick={handleSendOtp}
                    className="w-full text-center text-sm text-primary-foreground/40 hover:text-secondary transition-colors"
                  >
                    Didn't receive? Resend OTP
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-primary-foreground/30 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

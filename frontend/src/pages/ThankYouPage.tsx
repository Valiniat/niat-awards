import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Share2, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useToast } from "@/hooks/use-toast";

const SITE_URL = "https://www.niatawards.in";
const POSTER_PATH = "/share-poster.jpg";
const POSTER_FILENAME = "niat-guru-ratna-awards.jpg";

const isAbortError = (err: unknown) =>
  err instanceof DOMException && err.name === "AbortError";

const loadPosterFile = async () => {
  const res = await fetch(POSTER_PATH, { cache: "no-store" });
  // The SPA rewrite answers missing files with index.html and a 200, so the status
  // alone cannot tell us whether the poster actually shipped in this deployment.
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.startsWith("image/")) throw new Error("Could not load poster");
  const blob = await res.blob();
  if (!blob.size) throw new Error("Could not load poster");
  return new File([blob], POSTER_FILENAME, { type: blob.type || "image/jpeg" });
};

const trySharePoster = async (file: File, caption: string) => {
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data?: ShareData) => Promise<void>;
  };
  if (typeof nav.share !== "function") return false;

  const withFiles: ShareData = { files: [file], title: "NIAT Guru Ratna Awards 2026", text: caption };
  const filesOnly: ShareData = { files: [file], title: "NIAT Guru Ratna Awards 2026" };

  const canShare = (data: ShareData) => {
    try {
      return typeof nav.canShare !== "function" || nav.canShare(data);
    } catch {
      return false;
    }
  };

  if (canShare(withFiles)) {
    await nav.share(withFiles);
    return true;
  }
  if (canShare(filesOnly)) {
    await nav.share(filesOnly);
    return true;
  }
  return false;
};

const downloadPoster = (file: File) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = POSTER_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const ThankYouPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const isTeacher = params.get("type") === "teacher";
  const [sharing, setSharing] = useState(false);

  const caption = isTeacher
    ? `I just nominated myself for NIAT Guru Ratna Awards 2026! Nominate yours too: ${SITE_URL}`
    : `I just nominated my favourite teacher for NIAT Guru Ratna Awards 2026! Nominate yours too: ${SITE_URL}`;

  const handleWhatsAppShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const file = await loadPosterFile();
      const shared = await trySharePoster(file, caption);
      if (shared) return;

      downloadPoster(file);
      window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank", "noopener,noreferrer");
      toast({
        title: "Poster downloaded",
        description: "Attach the image in WhatsApp. The caption is already filled.",
      });
    } catch (err) {
      if (isAbortError(err)) return;
      window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank", "noopener,noreferrer");
      toast({
        title: "Could not attach the poster",
        description: "WhatsApp opened with the message. Attach the poster from your gallery if needed.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" id="main-content" role="main">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-[56px]">
        <div className="w-full max-w-md text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}>
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {isTeacher ? "Nomination Submitted! 🎉" : "🎉 Congratulations!"}
            </h1>
            <p className="text-foreground/65 text-base mb-2">Your nomination has been submitted successfully.</p>
            <p className="text-foreground/50 text-sm mb-8">
              {isTeacher
                ? "Updates will be sent via WhatsApp to the phone number you provided."
                : "🏆 Results will be announced on September 5th, on the occasion of Teachers’ Day."}
            </p>

            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-6">
              <p className={`font-heading font-semibold text-foreground ${isTeacher ? "mb-4" : "mb-1"}`}>
                {isTeacher ? "Help more teachers get recognized! 🙏" : "Help your teacher get more recognition! 🙏"}
              </p>
              {!isTeacher && (
                <p className="text-foreground/55 text-sm mb-4">Share with your friends and spread the word.</p>
              )}
              {!isTeacher && (
                <img
                  src={POSTER_PATH}
                  alt="NIAT Guru Ratna Awards poster"
                  className="w-full max-w-[240px] mx-auto mb-4 rounded-xl border border-border/50"
                />
              )}
              <button
                type="button"
                id="btn-thankyou-whatsapp-share"
                onClick={handleWhatsAppShare}
                disabled={sharing}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#9B2020] to-[#7A1515] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                {sharing ? "Opening WhatsApp..." : "Share on WhatsApp"}
              </button>
            </div>

            <button id="btn-thankyou-nominate-another" onClick={() => navigate(isTeacher ? "/nominate-teacher" : "/nominate-student")}
              className="w-full h-12 rounded-xl border border-border/50 text-foreground/65 font-medium flex items-center justify-center gap-2 hover:bg-muted transition-all">
              {isTeacher ? "Submit Another Nomination" : "Nominate Another Teacher"} <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ThankYouPage;

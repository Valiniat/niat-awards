import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import WhySection from "@/components/landing/WhySection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WinnersReceiveSection from "@/components/landing/WinnersReceiveSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <main id="main-content" role="main">
    <HeroSection />
    <WhySection />
    <CategoriesSection />
    <HowItWorksSection />
    <WinnersReceiveSection />
    <FinalCTASection />
    <Footer />
    </main>
  </div>
);

export default Index;

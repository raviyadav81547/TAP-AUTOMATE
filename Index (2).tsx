import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ToolsPreview from "@/components/landing/ToolsPreview";
import StudioSection from "@/components/landing/StudioSection";
import ArchiveSection from "@/components/landing/ArchiveSection";
import VaultPreview from "@/components/landing/VaultPreview";
import PricingSection from "@/components/landing/PricingSection";
import ReviewsSection from "@/components/landing/ReviewsSection";
import SupportSection from "@/components/landing/SupportSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ToolsPreview />
      <StudioSection />
      <ArchiveSection />
      <VaultPreview />
      <PricingSection />
      <ReviewsSection />
      <SupportSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default Index;

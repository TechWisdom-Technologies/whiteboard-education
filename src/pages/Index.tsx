import { useState, useCallback } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { HeroSection } from "@/components/public/HeroSection";
import { ServicesGrid } from "@/components/public/ServicesGrid";
import { StatsBanner } from "@/components/public/StatsBanner";
import { WhyMalaysiaSection } from "@/components/public/WhyMalaysiaSection";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";

import { BlogSection } from "@/components/public/BlogSection";
import { UniversityPartnersSection } from "@/components/public/UniversityPartnersSection";
import { PreFooterCTA } from "@/components/public/PreFooterCTA";
import { LeadBanner } from "@/components/public/LeadBanner";
import { VideoExpertWidget } from "@/components/public/VideoExpertWidget";

const Index = () => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const handleBannerVisibility = useCallback((visible: boolean) => setBannerVisible(visible), []);

  return (
    <div className="min-h-screen bg-white">
      <MegaMenu />
      <main>
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Core Services Grid */}
        <ServicesGrid />

        {/* 3. Informational Blocks ('Why Malaysia?') */}
        <WhyMalaysiaSection />

        {/* 4. Statistics Banner */}
        <StatsBanner />

        {/* 5. Testimonials/Student Stories */}
        <TestimonialsSection />



        {/* 7. Latest Articles/Guides */}
        <BlogSection />

        {/* 8. University Partners */}
        <UniversityPartnersSection />

        {/* 9. Pre-Footer CTA */}
        <PreFooterCTA />
      </main>

      <PublicFooter bannerVisible={bannerVisible} />
      <LeadBanner onVisibilityChange={handleBannerVisibility} />
      <VideoExpertWidget bannerVisible={bannerVisible} />
    </div>
  );
};

export default Index;

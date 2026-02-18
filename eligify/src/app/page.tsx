"use client";
import { EligifyHero } from "@/components/ui/eligify-hero";
import { EligifyLogo } from "@/components/ui/eligify-logo";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { SolutionsSection } from "@/components/ui/solutions-section";
import { SchemesSection } from "@/components/ui/schemes-section";
import { AboutSection } from "@/components/ui/about-section";
import { FileText, Brain, Scale, Users, CheckCircle, Shield } from "lucide-react";

export default function Home() {
  return (
    <main>
      <EligifyHero
        logo={null}
        navigation={[
          {
            label: "Home",
            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          },
          {
            label: "Solutions",
            onClick: () =>
              document
                .getElementById("solutions")
                ?.scrollIntoView({ behavior: "smooth" }),
          },
          {
            label: "Schemes",
            onClick: () =>
              document
                .getElementById("schemes")
                ?.scrollIntoView({ behavior: "smooth" }),
          },
          {
            label: "About",
            onClick: () =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" }),
          },
          {
            label: "Testimonials",
            onClick: () =>
              document
                .getElementById("testimonials")
                ?.scrollIntoView({ behavior: "smooth" }),
          },
        ]}
        contactButton={{
          label: "Contact Us",
          onClick: () => console.log("Contact clicked"),
        }}
        title="Instant Policy"
        highlightedText="Decision Engine"
        subtitle="Eligify is an AI-powered policy decision engine that helps citizens instantly understand their eligibility for government schemes, scholarships, and benefits. It converts complex rulebooks into actionable decisions."
        ctaButton={{
          label: "Check Eligibility",
          onClick: () => console.log("Check Eligibility clicked"),
        }}
        featureIcons={[
          {
            icon: <FileText className="text-white w-8 h-8" />,
            label: "Policy PDFs",
            position: { x: "10%", y: "20%" },
          },
          {
            icon: <Brain className="text-white w-8 h-8" />,
            label: "AI Logic",
            position: { x: "15%", y: "60%" },
          },
          {
            icon: <CheckCircle className="text-white w-8 h-8" />,
            label: "Instant Result",
            position: { x: "80%", y: "25%" },
          },
          {
            icon: <Users className="text-white w-8 h-8" />,
            label: "Citizens",
            position: { x: "75%", y: "65%" },
          },
        ]}
        trustedByText="Empowering Agencies"
        brands={[
          {
            name: "GovTech",
            logo: (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-white/50" />
                <span className="text-white/50 font-semibold text-lg">GovTech</span>
              </div>
            ),
          },
          {
            name: "ScholarLink",
            logo: (
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white/50" />
                <span className="text-white/50 font-semibold text-lg">ScholarLink</span>
              </div>
            ),
          },
          {
            name: "CivicFlow",
            logo: (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/50" />
                <span className="text-white/50 font-semibold text-lg">CivicFlow</span>
              </div>
            ),
          },
          {
            name: "PolicyAI",
            logo: (
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-white/50" />
                <span className="text-white/50 font-semibold text-lg">PolicyAI</span>
              </div>
            ),
          },
        ]}
      />

      <SolutionsSection />
      <SchemesSection />
      <AboutSection />
      <StaggerTestimonials />
    </main >
  );
}

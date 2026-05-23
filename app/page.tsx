import { Topbar } from "@/components/landing/Topbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PropertyTypes } from "@/components/landing/PropertyTypes";
import { Quote } from "@/components/landing/Quote";
import { Pricing } from "@/components/landing/Pricing";
import { Closing } from "@/components/landing/Closing";
import { Footer } from "@/components/landing/Footer";

export default function Page() {
  return (
    <>
      <Topbar />
      <main id="main">
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <PropertyTypes />
        <Quote />
        <Pricing />
        <Closing />
      </main>
      <Footer />
    </>
  );
}

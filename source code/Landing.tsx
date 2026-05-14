// src/app/landing/Landing.tsx
import Hero from "./Hero";
import CTA from "./CTA";
import About from "./About";
import Services from "./Services";
import TeamSection from "./TeamSection";

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Hero />
      <About />
      <Services />
      <CTA />
      <TeamSection />
    </div>
  );
};

export default Landing;
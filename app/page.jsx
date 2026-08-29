import Section from "@/components/Section";
import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <>
      <Section id="hero" first last={false}>
        <Hero />
      </Section>
      <Section id="experience" last={false}>
        <Timeline />
      </Section>
      <Section id="projects" last={true}>
        <Projects />
      </Section>
    </>
  );
}

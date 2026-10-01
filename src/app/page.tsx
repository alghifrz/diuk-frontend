import {
  BrandsMarquee,
  Cta,
  Dashboard,
  Features,
  Footer,
  Header,
  Hero,
  Impact,
  Pricing,
  Problem,
  Solutions,
  Testimonials,
  Workflow,
} from "@/components/landing";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="w-full">
        <Hero />
        <BrandsMarquee />
        <Problem />
        <Workflow />
        <Features />
        <Solutions />
        <Dashboard />
        <Impact />
        <Testimonials />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

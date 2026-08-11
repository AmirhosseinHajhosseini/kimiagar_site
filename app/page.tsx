import Topbar from "../components/layout/Topbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import Footer from "../components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Topbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </>
  );
}

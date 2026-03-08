"use client";
import PublicNavbar from "@/components/layouts/public-navbar";
import HeroSection from "@/components/landing/hero-section";
import TrustBadges from "@/components/landing/trust-badges";
import CategoriesShowcase from "@/components/landing/categories-showcase";
import FeaturedProducts from "@/components/landing/featured-products";
import HowItWorks from "@/components/landing/how-it-works";
import Footer from "@/components/layouts/footer";

export default function HomePage() {
  return (
    <main>
      <PublicNavbar />
      <HeroSection />
      <FeaturedProducts />
      <TrustBadges />
      <CategoriesShowcase />
      <HowItWorks />
      <Footer />
    </main>
  );
}

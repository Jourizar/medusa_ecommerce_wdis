import { getProducts } from "@/lib/medusa/products";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoriesSection } from "@/components/home/categories-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import type { MedusaProduct } from "@ecommerce/types";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  // Fetch featured products (newest / first 8)
  const featuredProducts: MedusaProduct[] = await getProducts({
    limit: 8,
    order: "-created_at",
  }).catch(() => []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts products={featuredProducts} />
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}

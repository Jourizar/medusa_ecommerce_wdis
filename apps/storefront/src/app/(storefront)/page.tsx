import type { Metadata } from "next";
import { getProducts } from "@/lib/medusa/products";
import { getCalendarEvents } from "@/lib/medusa/calendar";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewsletterSection } from "@/components/home/newsletter-section";
import type { MedusaProduct } from "@ecommerce/types";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featuredProducts, calendarEvents] = await Promise.all([
    getProducts({ limit: "8", order: "-created_at" }).catch(
      () => [] as MedusaProduct[]
    ),
    getCalendarEvents().catch(() => []),
  ]);

  return (
    <>
      <HeroSection />
      <CategoriesSection events={calendarEvents} />
      <FeaturedProducts products={featuredProducts} />
      <NewsletterSection />
    </>
  );
}

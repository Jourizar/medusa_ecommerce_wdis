import { getCarouselImages } from "@/lib/medusa/carousel";
import { HeroCarousel } from "./hero-carousel";

export async function HeroSection() {
  const slides = await getCarouselImages().catch(() => []);

  return (
    <section className="relative isolate bg-cream border-b-[6px] border-black overflow-hidden">
      {/* Diagonal stripes corner */}
      <div className="absolute top-0 right-0 w-48 h-48 brutal-stripes opacity-100 -translate-y-1/2 translate-x-1/4 rotate-12 hidden md:block" />
      <div className="absolute bottom-0 left-0 w-64 h-64 brutal-stripes-pink translate-y-1/2 -translate-x-1/4 -rotate-12 hidden md:block" />

      <div className="relative max-w-container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-5xl">
          <h1 className="text-brutal text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] text-black">
            <span className="inline-block bg-accent text-black px-4 border-[6px] border-black shadow-[10px_10px_0_0_#000] rotate-[-2deg]">
              WDIS
            </span>
          </h1>
        </div>

        <HeroCarousel slides={slides} />
      </div>
    </section>
  );
}

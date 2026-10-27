import { getArtProducts } from "@/lib/medusa/art";
import { ArtIndexGrid } from "@/components/art/art-index-grid";

export const metadata = {
  title: "All Art Pieces",
  description: "Every piece in the gallery at a glance.",
  alternates: { canonical: "/art/all" },
};

export const revalidate = 60;

export default async function ArtIndexPage() {
  const products = await getArtProducts().catch(() => []);

  return (
    <section className="max-w-container mx-auto px-4 sm:px-8 py-12 md:py-20">
      <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
        <h1 className="text-brutal text-4xl md:text-6xl">All Pieces</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-muted">
          {products.length} {products.length === 1 ? "work" : "works"}
        </p>
      </div>
      <ArtIndexGrid products={products} />
    </section>
  );
}

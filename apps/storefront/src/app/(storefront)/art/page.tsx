import { getArtProducts } from "@/lib/medusa/art";
import { ArtHero } from "@/components/art/art-hero";
import { ArtGallery } from "@/components/art/art-gallery";

export const metadata = {
  title: "Art Gallery",
  description: "Curated paintings and limited art pieces.",
  alternates: { canonical: "/art" },
};

export const revalidate = 60;

export default async function ArtPage() {
  const products = await getArtProducts().catch(() => []);

  return (
    <div>
      <ArtHero />
      <ArtGallery products={products} />
    </div>
  );
}

import { medusaFetch } from "./client";

export type CarouselImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  href: string | null;
  position: number;
  is_published: boolean;
};

export async function getCarouselImages(): Promise<CarouselImage[]> {
  const data = await medusaFetch<{ carousel_images: CarouselImage[] }>(
    `/carousel-images`
  );
  return data.carousel_images;
}

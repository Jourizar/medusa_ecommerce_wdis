import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { CAROUSEL_MODULE } from "../../../modules/carousel";
import CarouselModuleService from "../../../modules/carousel/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: CarouselModuleService = req.scope.resolve(CAROUSEL_MODULE);
  const images = await svc.listCarouselImages(
    {},
    { order: { position: "ASC" } }
  );
  res.json({ carousel_images: images });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc: CarouselModuleService = req.scope.resolve(CAROUSEL_MODULE);
  const body = req.body as Record<string, unknown>;
  const image = await svc.createCarouselImages(body as any);
  res.json({ carousel_image: image });
}

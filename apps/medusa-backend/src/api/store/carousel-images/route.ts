import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { CAROUSEL_MODULE } from "../../../modules/carousel";
import CarouselModuleService from "../../../modules/carousel/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: CarouselModuleService = req.scope.resolve(CAROUSEL_MODULE);
  const images = await svc.listCarouselImages(
    { is_published: true },
    { order: { position: "ASC" } }
  );
  res.json({ carousel_images: images });
}

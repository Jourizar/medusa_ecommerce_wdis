import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { CAROUSEL_MODULE } from "../../../../modules/carousel";
import CarouselModuleService from "../../../../modules/carousel/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: CarouselModuleService = req.scope.resolve(CAROUSEL_MODULE);
  const image = await svc.retrieveCarouselImage(req.params.id);
  res.json({ carousel_image: image });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc: CarouselModuleService = req.scope.resolve(CAROUSEL_MODULE);
  const body = req.body as Record<string, unknown>;
  const image = await svc.updateCarouselImages({
    id: req.params.id,
    ...body,
  } as any);
  res.json({ carousel_image: image });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc: CarouselModuleService = req.scope.resolve(CAROUSEL_MODULE);
  await svc.deleteCarouselImages(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}

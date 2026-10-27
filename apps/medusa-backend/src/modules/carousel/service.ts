import { MedusaService } from "@medusajs/framework/utils";
import { CarouselImage } from "./models/carousel-image";

class CarouselModuleService extends MedusaService({
  CarouselImage,
}) {}

export default CarouselModuleService;

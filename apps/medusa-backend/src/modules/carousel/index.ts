import { Module } from "@medusajs/framework/utils";
import CarouselModuleService from "./service";

export const CAROUSEL_MODULE = "carousel";

export default Module(CAROUSEL_MODULE, {
  service: CarouselModuleService,
});

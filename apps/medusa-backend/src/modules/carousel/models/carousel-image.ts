import { model } from "@medusajs/framework/utils";

export const CarouselImage = model.define("carousel_image", {
  id: model.id().primaryKey(),
  image_url: model.text(),
  alt_text: model.text().nullable(),
  href: model.text().nullable(),
  position: model.number().default(0),
  is_published: model.boolean().default(true),
});

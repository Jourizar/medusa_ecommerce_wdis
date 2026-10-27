import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { CreateInventoryItemInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { setupCheckout } from "./setup-checkout";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const apikeyModuleService = container.resolve(Modules.API_KEY);

  const countriesInRegions = ["US", "CA"];

  // Regions — one per country so each gets its own currency.
  // US and Canada are tax-exclusive by convention (tax added at checkout).
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "United States",
          currency_code: "usd",
          countries: ["us"],
          is_tax_inclusive: false,
        },
        {
          name: "Canada",
          currency_code: "cad",
          countries: ["ca"],
          is_tax_inclusive: false,
        },
      ],
    },
  });
  logger.info("Regions seeded.");

  // Sales channels
  logger.info("Seeding sales channel data...");
  const { result: salesChannelResult } = await createSalesChannelsWorkflow(
    container
  ).run({
    input: {
      salesChannelsData: [
        {
          name: "Webshop",
        },
        {
          name: "Amazon",
        },
        {
          name: "Shop",
        },
        {
          name: "Instagram",
        },
      ],
    },
  });
  logger.info("Sales channels seeded.");

  // Store
  logger.info("Seeding store data...");
  const { result: storeResult } = await updateStoresWorkflow(container).run({
    input: {
      selector: { id: "*" },
      update: {
        supported_currencies: [
          {
            currency_code: "usd",
            is_default: true,
          },
          {
            currency_code: "cad",
          },
        ],
        default_sales_channel_id: salesChannelResult[0].id,
      },
    },
  });
  logger.info("Store data seeded.");

  // Tax regions
  logger.info("Seeding tax region data...");
  await createTaxRegionsWorkflow(container).run({
    input: countriesInRegions.map((country_code) => ({
      country_code,
      // Without a provider, tax calculation (e.g. adding to cart) throws.
      provider_id: "tp_system",
    })),
  });
  logger.info("Tax region data seeded.");

  // Shipping profiles
  logger.info("Seeding shipping profile data...");
  const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default",
            type: "default",
          },
        ],
      },
    });
  logger.info("Shipping profile data seeded.");

  // Stock locations
  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "East Coast Warehouse",
          address: {
            address_1: "200 5th Ave",
            city: "New York",
            country_code: "US",
            postal_code: "10010",
          },
        },
        {
          name: "West Coast Warehouse",
          address: {
            address_1: "600 Congress Ave",
            city: "Austin",
            country_code: "US",
            postal_code: "78701",
          },
        },
      ],
    },
  });
  logger.info("Stock location data seeded.");

  // Link sales channels to stock locations
  logger.info("Linking sales channels to stock location...");
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocationResult[0].id,
      add: salesChannelResult.map((sc: any) => sc.id),
    },
  });
  logger.info("Sales channels linked to stock location.");

  // Create inventory items
  const inventoryItemService = container.resolve(Modules.INVENTORY);
  const inventoryItems = await Promise.all(
    [
      { sku: "URB-TEE-BLK-S", description: "Urban Tee Black S" },
      { sku: "URB-TEE-BLK-M", description: "Urban Tee Black M" },
      { sku: "URB-TEE-BLK-L", description: "Urban Tee Black L" },
      { sku: "URB-TEE-WHT-S", description: "Urban Tee White S" },
      { sku: "URB-TEE-WHT-M", description: "Urban Tee White M" },
      { sku: "URB-TEE-WHT-L", description: "Urban Tee White L" },
      { sku: "URB-HOO-BLK-M", description: "Urban Hoodie Black M" },
      { sku: "URB-HOO-BLK-L", description: "Urban Hoodie Black L" },
      { sku: "URB-HOO-GRY-M", description: "Urban Hoodie Grey M" },
      { sku: "URB-HOO-GRY-L", description: "Urban Hoodie Grey L" },
      { sku: "URB-JOG-BLK-M", description: "Urban Jogger Black M" },
      { sku: "URB-JOG-BLK-L", description: "Urban Jogger Black L" },
      { sku: "URB-CAP-BLK-OS", description: "Urban Cap Black OS" },
      { sku: "URB-CAP-WHT-OS", description: "Urban Cap White OS" },
      { sku: "URB-BKP-BLK-OS", description: "Urban Backpack Black OS" },
    ].map(async (item) => {
      return await inventoryItemService.createInventoryItems([item]);
    })
  );
  logger.info("Inventory items created.");

  const inventoryItemIds = inventoryItems.flat().map((i: any) => i.id);

  // Create inventory levels
  await inventoryItemService.createInventoryLevels(
    inventoryItemIds.flatMap((itemId: any) =>
      stockLocationResult.map((location: any) => ({
        location_id: location.id,
        inventory_item_id: itemId,
        stocked_quantity: 100,
      }))
    )
  );
  logger.info("Inventory levels created.");

  // Shipping options
  const fulfillmentSets = await Promise.all(
    stockLocationResult.map(async (location: any) => {
      const fulfillmentSet =
        await fulfillmentModuleService.createFulfillmentSets({
          name: `${location.name} Domestic`,
          type: "shipping",
          service_zones: [
            {
              name: `${location.name} Domestic`,
              geo_zones: [
                {
                  country_code: "us",
                  type: "country",
                },
                {
                  country_code: "ca",
                  type: "country",
                },
              ],
            },
          ],
        });
      return fulfillmentSet;
    })
  );
  logger.info("Fulfillment sets created.");

  // Publishable API key
  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  logger.info("Publishable API key data seeded.");

  // Link sales channels to API key
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKeyResult[0].id,
      add: salesChannelResult.map((sc: any) => sc.id),
    },
  });
  logger.info("Sales channels linked to API key.");

  // Product categories
  logger.info("Seeding product category data...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "T-Shirts",
          is_active: true,
        },
        {
          name: "Hoodies",
          is_active: true,
        },
        {
          name: "Bottoms",
          is_active: true,
        },
        {
          name: "Accessories",
          is_active: true,
        },
      ],
    },
  });
  logger.info("Product category data seeded.");

  // Products
  logger.info("Seeding product data...");
  const products = [
    {
      title: "Urban Classic Tee",
      description:
        "A timeless essential crafted from premium 100% cotton. Pre-shrunk, tailored fit with reinforced stitching. Built for everyday wear.",
      category_ids: [categoryResult[0].id],
      thumbnail:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
      images: [
        { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80" },
        { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&q=80" },
      ],
      options: [
        {
          title: "Size",
          values: ["S", "M", "L"],
        },
        {
          title: "Color",
          values: ["Black", "White"],
        },
      ],
      variants: [
        {
          title: "Black / S",
          sku: "URB-TEE-BLK-S",
          options: { Size: "S", Color: "Black" },
          prices: [
            { amount: 29.99, currency_code: "usd" },
            { amount: 40.99, currency_code: "cad" },
          ],
        },
        {
          title: "Black / M",
          sku: "URB-TEE-BLK-M",
          options: { Size: "M", Color: "Black" },
          prices: [
            { amount: 29.99, currency_code: "usd" },
            { amount: 40.99, currency_code: "cad" },
          ],
        },
        {
          title: "Black / L",
          sku: "URB-TEE-BLK-L",
          options: { Size: "L", Color: "Black" },
          prices: [
            { amount: 29.99, currency_code: "usd" },
            { amount: 40.99, currency_code: "cad" },
          ],
        },
        {
          title: "White / S",
          sku: "URB-TEE-WHT-S",
          options: { Size: "S", Color: "White" },
          prices: [
            { amount: 29.99, currency_code: "usd" },
            { amount: 40.99, currency_code: "cad" },
          ],
        },
        {
          title: "White / M",
          sku: "URB-TEE-WHT-M",
          options: { Size: "M", Color: "White" },
          prices: [
            { amount: 29.99, currency_code: "usd" },
            { amount: 40.99, currency_code: "cad" },
          ],
        },
        {
          title: "White / L",
          sku: "URB-TEE-WHT-L",
          options: { Size: "L", Color: "White" },
          prices: [
            { amount: 29.99, currency_code: "usd" },
            { amount: 40.99, currency_code: "cad" },
          ],
        },
      ],
    },
    {
      title: "Street Hoodie",
      description:
        "Heavyweight 400gsm French terry cotton hoodie. Oversized fit with dropped shoulders, kangaroo pocket, and double-layered hood.",
      category_ids: [categoryResult[1].id],
      thumbnail:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80",
      images: [
        { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80" },
        { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80" },
      ],
      options: [
        {
          title: "Size",
          values: ["M", "L"],
        },
        {
          title: "Color",
          values: ["Black", "Grey"],
        },
      ],
      variants: [
        {
          title: "Black / M",
          sku: "URB-HOO-BLK-M",
          options: { Size: "M", Color: "Black" },
          prices: [
            { amount: 79.99, currency_code: "usd" },
            { amount: 109.99, currency_code: "cad" },
          ],
        },
        {
          title: "Black / L",
          sku: "URB-HOO-BLK-L",
          options: { Size: "L", Color: "Black" },
          prices: [
            { amount: 79.99, currency_code: "usd" },
            { amount: 109.99, currency_code: "cad" },
          ],
        },
        {
          title: "Grey / M",
          sku: "URB-HOO-GRY-M",
          options: { Size: "M", Color: "Grey" },
          prices: [
            { amount: 79.99, currency_code: "usd" },
            { amount: 109.99, currency_code: "cad" },
          ],
        },
        {
          title: "Grey / L",
          sku: "URB-HOO-GRY-L",
          options: { Size: "L", Color: "Grey" },
          prices: [
            { amount: 79.99, currency_code: "usd" },
            { amount: 109.99, currency_code: "cad" },
          ],
        },
      ],
    },
    {
      title: "Tactical Joggers",
      description:
        "Slim-tapered joggers with articulated knees, zippered cargo pockets, and elasticated cuffs. Ripstop cotton blend for durability.",
      category_ids: [categoryResult[2].id],
      thumbnail:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80",
      images: [
        { url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80" },
        { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=80" },
      ],
      options: [
        {
          title: "Size",
          values: ["M", "L"],
        },
        {
          title: "Color",
          values: ["Black"],
        },
      ],
      variants: [
        {
          title: "Black / M",
          sku: "URB-JOG-BLK-M",
          options: { Size: "M", Color: "Black" },
          prices: [
            { amount: 69.99, currency_code: "usd" },
            { amount: 95.99, currency_code: "cad" },
          ],
        },
        {
          title: "Black / L",
          sku: "URB-JOG-BLK-L",
          options: { Size: "L", Color: "Black" },
          prices: [
            { amount: 69.99, currency_code: "usd" },
            { amount: 95.99, currency_code: "cad" },
          ],
        },
      ],
    },
    {
      title: "WDIS Snapback Cap",
      description:
        "Structured six-panel snapback with flat brim and embroidered logo. Adjustable snap closure for a custom fit.",
      category_ids: [categoryResult[3].id],
      thumbnail:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80",
      images: [
        { url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80" },
        { url: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&q=80" },
      ],
      options: [
        {
          title: "Color",
          values: ["Black", "White"],
        },
      ],
      variants: [
        {
          title: "Black",
          sku: "URB-CAP-BLK-OS",
          options: { Color: "Black" },
          prices: [
            { amount: 34.99, currency_code: "usd" },
            { amount: 47.99, currency_code: "cad" },
          ],
        },
        {
          title: "White",
          sku: "URB-CAP-WHT-OS",
          options: { Color: "White" },
          prices: [
            { amount: 34.99, currency_code: "usd" },
            { amount: 47.99, currency_code: "cad" },
          ],
        },
      ],
    },
    {
      title: "Urban Daypack",
      description:
        "Compact 20L backpack with padded 15\" laptop sleeve, organizer pockets, and water-resistant coating. Clean minimalist design.",
      category_ids: [categoryResult[3].id],
      thumbnail:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80",
      images: [
        { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80" },
        { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=900&q=80" },
      ],
      options: [
        {
          title: "Color",
          values: ["Black"],
        },
      ],
      variants: [
        {
          title: "Black",
          sku: "URB-BKP-BLK-OS",
          options: { Color: "Black" },
          prices: [
            { amount: 89.99, currency_code: "usd" },
            { amount: 122.99, currency_code: "cad" },
          ],
        },
      ],
    },
  ];

  for (const product of products) {
    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: product.title,
            description: product.description,
            category_ids: product.category_ids,
            status: "published",
            images: product.images,
            options: product.options,
            sales_channels: salesChannelResult.map((sc: any) => ({ id: sc.id })),
            variants: product.variants.map((variant) => ({
              title: variant.title,
              sku: variant.sku,
              options: variant.options,
              prices: variant.prices,
              manage_inventory: true,
              inventory_items: product.variants
                .map((v) => {
                  if (v.sku === variant.sku) {
                    return {
                      inventory_item_id:
                        inventoryItems.flat().find((i: any) => i.sku === v.sku)?.id,
                      required_quantity: 1,
                    };
                  }
                  return null;
                })
                .filter(Boolean) as {
                inventory_item_id: string;
                required_quantity: number;
              }[],
            })),
          },
        ],
      },
    });
    logger.info(`Product "${product.title}" seeded.`);
  }

  // Stripe on regions, fulfillment links, shipping options, product profiles.
  await setupCheckout(container);

  logger.info("Seed data complete!");
}

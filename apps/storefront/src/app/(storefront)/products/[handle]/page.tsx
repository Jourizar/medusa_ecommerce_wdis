import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle, getProducts } from "@/lib/medusa/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";
import { getHighestPrice, getLowestPrice } from "@/lib/utils/price";
import { CURRENCY, SITE_NAME } from "@/lib/constants";
import { absoluteUrl, jsonLd, truncate } from "@/lib/site";
import type { MedusaProduct } from "@ecommerce/types";

interface ProductDetailPageProps {
  params: Promise<{ handle: string }>;
}

// Render each product on its first request, then serve it from the ISR cache.
// Prerendering at build time would make `docker build` depend on the backend
// being reachable, which it isn't on a first deploy or during a restart.
export async function generateStaticParams() {
  return [];
}

function productDescription(product: MedusaProduct): string {
  return truncate(
    product.description || `Shop ${product.title} at ${SITE_NAME}.`
  );
}

function productImages(product: MedusaProduct): string[] {
  const urls = product.images?.map((img) => img.url) ?? [];
  if (urls.length === 0 && product.thumbnail) urls.push(product.thumbnail);
  return urls;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);

  if (!product) return { title: "Product Not Found", robots: { index: false } };

  const description = productDescription(product);
  const images = productImages(product);
  const path = `/products/${product.handle}`;

  return {
    title: product.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: product.title,
      description,
      ...(images.length > 0 && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      ...(images.length > 0 && { images }),
    },
  };
}

/** schema.org Product + BreadcrumbList so Google can show price and stock. */
function productStructuredData(product: MedusaProduct) {
  const url = absoluteUrl(`/products/${product.handle}`);
  const low = getLowestPrice(product.variants);
  const high = getHighestPrice(product.variants);
  const currency = (
    (product.variants?.[0] as { calculated_price?: { currency_code?: string } })
      ?.calculated_price?.currency_code ?? CURRENCY
  ).toUpperCase();
  const inStock = (product.variants ?? []).some(
    (v) => !v.manage_inventory || v.allow_backorder || (v.inventory_quantity ?? 0) > 0
  );
  const availability = `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`;

  const offers =
    low === null
      ? undefined
      : low === high
        ? {
            "@type": "Offer",
            url,
            price: low.toFixed(2),
            priceCurrency: currency,
            availability,
            itemCondition: "https://schema.org/NewCondition",
          }
        : {
            "@type": "AggregateOffer",
            url,
            lowPrice: low.toFixed(2),
            highPrice: (high ?? low).toFixed(2),
            priceCurrency: currency,
            offerCount: product.variants?.length ?? 1,
            availability,
          };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.title,
        description: productDescription(product),
        image: productImages(product),
        url,
        sku: product.variants?.[0]?.sku ?? undefined,
        brand: { "@type": "Brand", name: SITE_NAME },
        ...(offers && { offers }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Products", item: absoluteUrl("/products") },
          { "@type": "ListItem", position: 3, name: product.title, item: url },
        ],
      },
    ],
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { handle } = await params;
  // Backend/network errors propagate to the error boundary; only a genuine
  // "no product with this handle" response should 404.
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  // Fetch related products (same collection or type, excluding current)
  const relatedProducts = await getProducts({
    limit: "8",
  })
    .then((prods: MedusaProduct[]) =>
      prods.filter((p) => p.id !== product.id).slice(0, 4)
    )
    .catch(() => []);

  return (
    <div className="max-w-container mx-auto px-4 py-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(productStructuredData(product))}
      />

      {/* Breadcrumb */}
      <nav className="text-[11px] font-black uppercase tracking-widest text-muted mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="hover:text-primary transition-colors">
              Products
            </Link>
          </li>
          <li>/</li>
          <li className="text-black truncate" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Product detail grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <ProductInfo product={product} />
          <PurchasePanel product={product} />
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t-[4px] border-black pt-12">
          <h2 className="text-brutal text-4xl md:text-5xl text-black mb-10">
            YOU MIGHT{" "}
            <span className="bg-hotpink px-2 inline-block border-[4px] border-black -rotate-1">
              ALSO LIKE
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related: MedusaProduct, i) => (
              <Reveal key={related.id} index={i}>
                <ProductCard product={related} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

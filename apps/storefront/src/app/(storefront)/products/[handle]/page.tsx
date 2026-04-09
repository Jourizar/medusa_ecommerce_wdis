import { notFound } from "next/navigation";
import { getProduct, getProductByHandle } from "@/lib/medusa/products";
import { getProducts } from "@/lib/medusa/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductVariants } from "@/components/product/product-variants";
import { AddToCartButton } from "@/components/product/add-to-cart";
import { ProductCard } from "@/components/product/product-card";
import type { MedusaProduct } from "@ecommerce/types";

interface ProductDetailPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts({ limit: 100 }).catch(() => []);
  return products.map((product: MedusaProduct) => ({
    handle: product.handle,
  }));
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.title,
    description: product.description || `Shop ${product.title} at URBN.`,
    openGraph: {
      images: product.images?.map((img) => img.url) || [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);

  if (!product) notFound();

  // Fetch related products (same collection or type, excluding current)
  const relatedProducts = await getProducts({
    limit: 4,
  })
    .then((prods: MedusaProduct[]) =>
      prods.filter((p) => p.id !== product.id).slice(0, 4)
    )
    .catch(() => []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/" className="hover:text-text transition-colors">
              Home
            </a>
          </li>
          <li>/</li>
          <li>
            <a href="/products" className="hover:text-text transition-colors">
              Products
            </a>
          </li>
          <li>/</li>
          <li className="text-text" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Product detail grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <ProductInfo product={product} />
          <ProductVariants product={product} />
          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border pt-12">
          <h2 className="text-2xl font-display font-bold text-text mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related: MedusaProduct) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="bg-cream border-[4px] border-black shadow-[6px_6px_0_0_#000] p-8 md:p-12 text-center max-w-lg">
        <p className="text-brutal text-5xl md:text-6xl text-black">404</p>
        <p className="text-brutal text-2xl md:text-3xl text-black mt-2">
          PAGE NOT FOUND.
        </p>
        <p className="text-sm font-bold uppercase tracking-wider text-muted mt-4">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center text-xs font-black uppercase tracking-widest border-[3px] border-black bg-hotpink text-black px-4 py-2 hover:bg-accent transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}

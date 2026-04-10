import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { CartProvider } from "@/providers/cart-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "URBN — Premium Streetwear & Urban Fashion",
    template: "%s | URBN",
  },
  description:
    "Premium streetwear and urban fashion. Bold designs, limited drops. Shop the latest collection.",
  keywords: ["streetwear", "urban fashion", "premium clothing", "limited drops"],
  authors: [{ name: "URBN" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "URBN",
    title: "URBN — Premium Streetwear & Urban Fashion",
    description: "Bold designs, limited drops. Shop the latest collection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "URBN — Premium Streetwear & Urban Fashion",
    description: "Bold designs, limited drops.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1 },
  },
};

// Inline CSS fallback (Tailwind not compiling in this setup)
const InlineStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    *, *::before, *::after { box-sizing: border-box; }
    * { margin: 0; }
    html { scroll-behavior: smooth; }
    body {
      background-color: #0F0F0F;
      color: #F1F1F1;
      font-family: ${inter.style.fontFamily}, system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.5;
    }
    
    /* Reset & Base */
    h1, h2, h3, h4, h5, h6 { font-weight: inherit; }
    a { color: inherit; text-decoration: none; }
    button, input, select, textarea { font: inherit; }
    img, svg { display: block; }
    
    /* Custom scrollbar */
    * { scrollbar-width: thin; scrollbar-color: #6D28D9 #1A1A2E; }
    *::-webkit-scrollbar { width: 6px; }
    *::-webkit-scrollbar-track { background: #1A1A2E; }
    *::-webkit-scrollbar-thumb { background: #6D28D9; border-radius: 3px; }
    
    /* Layout utilities */
    .min-h-screen { min-height: 100vh; }
    .flex { display: flex; }
    .flex-1 { flex: 1; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    
    /* Grid */
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    
    /* Container */
    .container { width: 100%; max-width: 1280px; margin-left: auto; margin-right: auto; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    
    /* Spacing */
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .pt-20 { padding-top: 5rem; }
    .pb-8 { padding-bottom: 2rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-12 { margin-bottom: 3rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    
    /* Sizing */
    .h-16 { height: 4rem; }
    .h-8 { height: 2rem; }
    .h-0\\.5 { height: 0.125rem; }
    .w-5 { width: 1.25rem; }
    
    /* Position */
    .fixed { position: fixed; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .top-0 { top: 0; }
    .left-0 { left: 0; }
    .right-0 { right: 0; }
    .bottom-0 { bottom: 0; }
    .z-40 { z-index: 40; }
    
    /* Display */
    .hidden { display: none; }
    .inline-flex { display: inline-flex; }
    .block { display: block; }
    
    /* Typography */
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .font-black { font-weight: 900; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .uppercase { text-transform: uppercase; }
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-wider { letter-spacing: 0.05em; }
    .text-center { text-align: center; }
    
    /* Colors */
    .bg-bg { background-color: #0F0F0F; }
    .text-text { color: #F1F1F1; }
    .text-text-muted { color: #A0A0B0; }
    .text-primary { color: #6D28D9; }
    .bg-primary { background-color: #6D28D9; }
    .text-gradient {
      background: linear-gradient(135deg, #6D28D9, #F59E0B);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Borders */
    .border-t { border-top-width: 1px; }
    .border-border { border-color: rgba(255, 255, 255, 0.08); }
    .rounded-full { border-radius: 9999px; }
    .rounded-xl { border-radius: 0.75rem; }
    
    /* Glass effects */
    .glass {
      background: rgba(26, 26, 46, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-elevated {
      background: rgba(37, 37, 64, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .bg-surface\\/50 { background-color: rgba(26, 26, 46, 0.5); }
    .bg-transparent { background-color: transparent; }
    
    /* Transitions */
    .transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
    .transition-all { transition-property: all; transition-duration: 200ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
    
    /* Hover */
    .hover\\:text-text:hover { color: #F1F1F1; }
    .hover\\:bg-surface-elevated:hover { background-color: #252540; }
    .hover\\:text-primary:hover { color: #7C3AED; }
    .hover\\:border-primary:hover { border-color: #6D28D9; }
    .active\\:scale-\\[0\\.97\\]:active { transform: scale(0.97); }
    
    /* Button */
    button, [role="button"] {
      cursor: pointer;
      font-weight: 600;
      border: none;
      background: none;
    }
    button:disabled { pointer-events: none; opacity: 0.5; }
    button:focus-visible, [role="button"]:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px #6D28D9, 0 0 0 4px #0F0F0F;
    }
    
    /* Shimmer animation */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .shimmer {
      background: linear-gradient(90deg, #1A1A2E 25%, #252540 50%, #1A1A2E 75%);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }
    
    /* Focus */
    .focus-visible\\:outline-none:focus-visible { outline: 2px solid transparent; outline-offset: 2px; }
    .focus-visible\\:ring-2:focus-visible { box-shadow: 0 0 0 2px #6D28D9; }
    .focus-visible\\:ring-primary:focus-visible { --tw-ring-color: #6D28D9; }
    .focus-visible\\:ring-offset-2:focus-visible { --tw-ring-offset-width: 2px; }
    .focus-visible\\:ring-offset-bg:focus-visible { --tw-ring-offset-color: #0F0F0F; }
    
    /* Responsive */
    @media (min-width: 768px) {
      .md\\:flex { display: flex; }
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .md\\:col-span-1 { grid-column: span 1 / span 1; }
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .md\\:gap-12 { gap: 3rem; }
      .md\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    }
    
    @media (min-width: 640px) {
      .sm\\:flex-row { flex-direction: row; }
      .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    
    /* Card styles */
    .overflow-hidden { overflow: hidden; }
    .rounded-2xl { border-radius: 1rem; }
    .aspect-square { aspect-ratio: 1 / 1; }
    .object-cover { object-fit: cover; }
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* Product card hover */
    .hover\\:translate-y-\\[-4px\\]:hover { transform: translateY(-4px); }
    .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.2); }
    .hover\\:shadow-primary\\/20:hover { box-shadow: 0 10px 15px -3px rgba(109,40,217,0.2); }
    
    /* Badges */
    .inline-block { display: inline-block; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
    .rounded-md { border-radius: 0.375rem; }
    .bg-accent { background-color: #F59E0B; }
    .text-text-inverse { color: #0F0F0F; }
    .text-xs-badge { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; }
    
    /* Animations */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }
    
    /* Section */
    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
    .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
    .md\\:py-24 { padding-top: 6rem; padding-bottom: 6rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    
    /* Button variants */
    .btn-primary {
      background-color: #6D28D9;
      color: #F1F1F1;
    }
    .btn-primary:hover { background-color: #7C3AED; }
    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: #F1F1F1;
    }
    .btn-outline:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.3);
    }
    
    /* Product grid gap */
    .gap-4 { gap: 1rem; }
    
    /* Price strikethrough */
    .line-through { text-decoration: line-through; }
    .opacity-60 { opacity: 0.6; }
    
    /* Cart slide */
    .fixed-cart {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 100%;
      max-width: 420px;
      z-index: 50;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    .fixed-cart.open { transform: translateX(0); }
    
    /* Overlay */
    .fixed-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 40;
    }
  `}} />
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <InlineStyles />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased" suppressHydrationWarning>
        <ConvexClientProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

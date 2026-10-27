import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { SeasonEffects } from "@/components/season/season-effects";
import { getActiveSeason } from "@/lib/medusa/season";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Holiday theme toggled in admin → Seasons (cached ~30s).
  const season = await getActiveSeason().catch(() => null);

  return (
    <>
      <Navbar />
      <Suspense>
        <SeasonEffects season={season} />
      </Suspense>
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}

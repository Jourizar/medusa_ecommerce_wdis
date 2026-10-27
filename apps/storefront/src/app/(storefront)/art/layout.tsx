import { ArtSubnav } from "@/components/art/art-subnav";

export default function ArtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArtSubnav />
      {children}
    </>
  );
}

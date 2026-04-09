import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { OrderHistory } from "@/components/account/order-history";
import { ProfileCard } from "@/components/account/profile-card";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your profile and orders.",
};

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-display font-bold text-text mb-8">
            My Account
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile sidebar */}
            <aside>
              <ProfileCard />
            </aside>

            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <OrderHistory />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

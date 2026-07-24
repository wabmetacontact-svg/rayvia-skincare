import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Admin",
  description: "Rayvia internal admin dashboard for managing products, orders, coupons, reviews and newsletter subscribers.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}

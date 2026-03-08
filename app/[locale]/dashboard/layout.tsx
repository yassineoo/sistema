import { AuthProvider } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/layouts/dashboard-navbar";
import RouteGuard from "@/components/layouts/route-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <RouteGuard>
        <DashboardNavbar>{children}</DashboardNavbar>
      </RouteGuard>
    </AuthProvider>
  );
}

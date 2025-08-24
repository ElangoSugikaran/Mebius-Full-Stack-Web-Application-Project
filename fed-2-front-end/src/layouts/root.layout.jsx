import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AdminFloatingButton from "@/components/AdminFloatingButton";
import { Outlet, useLocation } from "react-router";
import { useUser } from "@clerk/clerk-react";

const RootLayout = () => {
  const { user } = useUser();
  const location = useLocation();
  
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const isOnAdminRoute = location.pathname.startsWith('/admin');
  
  const shouldShowNavigation = () => {
    if (!isAdmin) return true;
    return !isOnAdminRoute;
  };

  return (
    <>
      {/* Navigation - Only show when appropriate */}
      {shouldShowNavigation() && <Navigation />}
      
      {/* Main Content */}
      <main className="min-h-screen">
        <Outlet />
      </main>
      
      {/* Footer - Show on all client pages, hide on admin pages */}
      {shouldShowNavigation() && <Footer />}
      
      {/* Admin Floating Button */}
      {shouldShowNavigation() && <AdminFloatingButton />}
    </>
  );
};

export default RootLayout;
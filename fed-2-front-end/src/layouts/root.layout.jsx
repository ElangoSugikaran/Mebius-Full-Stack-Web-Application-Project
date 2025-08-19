// RootLayout.jsx - Smart layout that adapts to user role and current route

import { useEffect } from "react"; // ← ADD THIS IMPORT
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AdminFloatingButton from "@/components/AdminFloatingButton";
import { Outlet, useLocation } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useSyncCurrentUserMutation } from "@/lib/api";

const RootLayout = () => {
  const { user } = useUser();
  const location = useLocation();
  const [syncUser] = useSyncCurrentUserMutation();

  // Add this useEffect after other useEffects:
  useEffect(() => {
    // Auto-sync user when app loads and user is signed in
    const syncUserData = async () => {
      try {
        await syncUser().unwrap();
        console.log("✅ User synced automatically");
      } catch (error) {
        console.error("❌ Auto-sync failed:", error);
      }
    };
    
    // Only sync if user is signed in
    if (user?.id) {
      syncUserData();
    }
  }, [user?.id, syncUser]);
  
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

/*
🎯 HOW THIS WORKS:

SCENARIO 1 - Regular User:
✅ /home → Shows Navigation + Home Page
✅ /shop → Shows Navigation + Shop Page
❌ /admin → Redirected by AdminProtectedLayout

SCENARIO 2 - Admin User on Client Routes:
✅ /home → Shows Navigation + Home Page (admin can shop too!)
✅ /shop → Shows Navigation + Shop Page (admin can browse)
✅ /cart → Shows Navigation + Cart Page (admin can buy)

SCENARIO 3 - Admin User on Admin Routes:
❌ /admin → NO Navigation, just Admin Dashboard
❌ /admin/products → NO Navigation, just Admin Products Page
❌ /admin/orders → NO Navigation, just Admin Orders Page

🔄 FLOW:
1. User logs in
2. RootLayout checks: "Is this user an admin?"
3. RootLayout checks: "Are we on admin routes?"
4. Based on answers → Show/Hide navigation
5. Admin gets clean admin UI, but can still access client features
*/
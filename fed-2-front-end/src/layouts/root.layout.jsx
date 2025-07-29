// import Navigation from "@/components/Navigation"
// import { Outlet } from "react-router"

// const RootLayout = () => {
//   return (
//     <>
//       <Navigation />
//       <Outlet />
//     </>
//   )
// }

// export default RootLayout

// RootLayout.jsx - Smart layout that adapts to user role and current route

import Navigation from "@/components/Navigation";
import AdminFloatingButton from "@/components/AdminFloatingButton";
import { Outlet, useLocation } from "react-router";
import { useUser } from "@clerk/clerk-react";

const RootLayout = () => {
  const { user } = useUser();
  const location = useLocation();
  
  // 🔍 Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin';
  
  // 🔍 Check if currently on admin routes
  const isOnAdminRoute = location.pathname.startsWith('/admin');
  
  // 🎯 LOGIC: When to show navigation bar
  const shouldShowNavigation = () => {
    // Always show navigation for non-admin users
    if (!isAdmin) return true;
    
    // For admin users:
    // - Hide navigation when on admin routes
    // - Show navigation when on client routes (so admin can use client UI)
    return !isOnAdminRoute;
  };

  return (
    <>
      {/* 🎭 CONDITIONAL NAVIGATION - Only show when appropriate */}
      {shouldShowNavigation() && <Navigation />}
      
      {/* 📄 PAGE CONTENT - Always show */}
      <Outlet />
      
      {/* ⚡ FLOATING ADMIN BUTTON - Quick access for admins on client pages */}
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
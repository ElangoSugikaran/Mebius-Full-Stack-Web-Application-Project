import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Plus,
  LogOut,
  Home,
  ExternalLink
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";

const AdminDashboardLayout = () => {
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  // 📋 ADMIN MENU ITEMS
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // 🏪 CLIENT ACCESS MENU - So admin can use the store
  const clientAccess = [
    { name: 'View Store', href: '/', icon: Home, description: 'Go to main store' },
    { name: 'Shop Products', href: '/shop', icon: Package, description: 'Browse products' },
    { name: 'My Cart', href: '/cart', icon: ShoppingCart, description: 'View shopping cart' },
  ];

  // 🚪 HANDLE LOGOUT
  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 📱 LEFT SIDEBAR */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white shadow-lg">
        
        {/* 🏷️ HEADER */}
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        {/* 👤 USER INFO */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
              <p className="text-xs text-blue-600 font-medium">Administrator</p>
            </div>
          </div>
        </div>
        
        {/* 🗂️ ADMIN NAVIGATION */}
        <nav className="mt-4 px-4">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Admin Panel
            </h3>
          </div>
          
          {adminNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 mb-1 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 🏪 CLIENT ACCESS SECTION */}
        <div className="mt-6 px-4">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Store Access
            </h3>
          </div>
          
          {clientAccess.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center px-3 py-2 mb-1 rounded-md text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
              title={item.description}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
              <ExternalLink className="ml-auto h-3 w-3" />
            </Link>
          ))}
        </div>

        {/* 🚪 LOGOUT SECTION */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* 📄 MAIN CONTENT */}
      <div className="pl-64">
        <main className="py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;

/*
🎯 NEW FEATURES ADDED:

1. 🏪 STORE ACCESS SECTION:
   - "View Store" → Goes to homepage (with navigation)
   - "Shop Products" → Goes to shop page (with navigation)  
   - "My Cart" → Goes to cart (with navigation)

2. 🎨 VISUAL IMPROVEMENTS:
   - Section headers ("Admin Panel", "Store Access")
   - Different hover colors for client links (green)
   - External link icon to show it goes outside admin

3. 🚪 PROPER LOGOUT:
   - Actually calls Clerk's signOut function
   - Changes color on hover to indicate action

🔄 HOW ADMIN EXPERIENCE WORKS:
1. Admin logs in → Sees admin dashboard (no navigation bar)
2. Admin clicks "View Store" → Goes to client homepage (with navigation bar)
3. Admin can shop, add to cart, etc. like a regular user
4. Admin can always come back to /admin to manage the store
*/
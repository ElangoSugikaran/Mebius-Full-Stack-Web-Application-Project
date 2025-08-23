import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  Settings,
  LogOut,
  Home,
  ExternalLink,
  FolderOpen,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Store,
  CreditCard,
  Truck,
  Shield,
  Mail,
  BarChart3,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { SignedIn, UserButton, SignedOut } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const AdminDashboardLayout = () => {
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  
  // 🔄 SIDEBAR STATE - Controls minimize/maximize
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 🎛️ SETTINGS DROPDOWN STATE
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  // 📋 ADMIN MENU ITEMS (without Settings - we'll handle it separately)
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Sales', href: '/admin/sales', icon: BarChart3 },
    { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/admin-orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
  ];


  // 🏪 CLIENT ACCESS MENU
  const clientAccess = [
    { name: 'View Store', href: '/', icon: Home, description: 'Go to main store' },
    { name: 'Shop Products', href: '/shop', icon: Package, description: 'Browse products' },
  ];

  // 📱 TOGGLE SIDEBAR
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 📱 TOGGLE MOBILE MENU
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 🎛️ TOGGLE SETTINGS DROPDOWN
  const toggleSettingsDropdown = () => {
    setSettingsDropdownOpen(!settingsDropdownOpen);
  };

  // 🔍 CHECK IF CURRENT PATH IS A SETTINGS ROUTE
  const isSettingsRoute = location.pathname.startsWith('/admin/settings');

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 📱 DESKTOP SIDEBAR */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-30 overflow-y-auto ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } hidden lg:block`}>
        
        {/* 🏷️ HEADER with Toggle Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-900">Mebius Dashboard</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-gray-100"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* 🗂️ ADMIN NAVIGATION */}
        <nav className="mt-4 px-2">
          {!sidebarCollapsed && (
            <div className="mb-4 px-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Admin Panel
              </h3>
            </div>
          )}
          
          {/* Regular Navigation Items */}
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
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.name : ''}
              >
                <item.icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* 🏪 CLIENT ACCESS SECTION */}
        {!sidebarCollapsed && (
          <div className="mt-6 px-2">
            <div className="mb-4 px-2">
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
        )}
      </div>

      {/* 📱 MOBILE SIDEBAR */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
        <div className="fixed left-0 top-0 w-64 h-full bg-white shadow-lg overflow-y-auto">
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-1.5"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="mt-4 px-4">
            {/* Regular Navigation Items */}
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={toggleMobileMenu}
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
        </div>
      </div>

      {/* 📄 MAIN CONTENT */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        
        {/* 🧭 TOP NAVIGATION BAR - SIMPLIFIED */}
        <div className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          
          {/* 📱 MOBILE MENU BUTTON */}
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-1.5 mr-4"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>

          {/* 💼 ADMIN TITLE (Desktop) */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-gray-900">Store Administration</h1>
            <p className="text-sm text-gray-500">Manage your ecommerce store</p>
          </div>

          {/* 👤 USER SECTION - IMPROVED */}
          <div className="flex items-center space-x-4">
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                    userButtonPopoverCard: "shadow-lg border",
                    userButtonPopoverActions: "space-y-2"
                  }
                }}
                showName={false}
                afterSignOutUrl="/"
              />
            </SignedIn>
            <SignedOut>
              <Link to="/">
                <Button>Sign In</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
       
        {/* 📄 PAGE CONTENT */}
        <main className="py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
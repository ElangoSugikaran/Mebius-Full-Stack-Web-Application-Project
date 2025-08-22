import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag, Search, User, Heart, Package } from "lucide-react";
import { SignedIn, UserButton, SignedOut, useUser } from "@clerk/clerk-react";
import ProductSearchForm from "./ProductSearchForm";
import { useGetCartItemCountQuery, useGetWishlistItemCountQuery } from "@/lib/api";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { data: cartItemCount = 0 } = useGetCartItemCountQuery();

   // 🔧 ADD: Fetch wishlist count using RTK Query
  const { data: wishlistItemCount = 0 } = useGetWishlistItemCountQuery();

  // ✅ GOOD: Function to close mobile menu
  const closeMobileMenu = () => setIsMenuOpen(false);

  // ✅ ORGANIZED: Navigation items in a constant for reusability
  const navigationItems = [
    { path: "/shop/shoes", label: "Shoes" },
    { path: "/shop/tshirts", label: "T-Shirt" },
    { path: "/shop/shorts", label: "Shorts" },
    { path: "/shop/pants", label: "Pants" },
    { path: "/shop/socks", label: "Socks" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-16">
      <div>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-bold text-2xl">
            Mebius
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="font-medium hover:text-gray-600 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Toggle Button */}
            <button 
              aria-label="Search" 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>
            
            {/* Wishlist Icon */}
            <Link
              to="/shop/wishlist"
              aria-label="Wishlist"
              className="p-1 relative hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <Heart size={20} />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                </span>
              )}
            </Link>
            
            {/* Shopping Cart Icon */}
            <Link
              to="/shop/cart"
              aria-label="Shopping Bag"
              className="p-1 relative hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Authentication Section - Fixed */}
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              >
                {/* 🔧 FIX: Custom menu item for My Orders */}
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Orders"
                    labelIcon={<Package size={16} />}
                    href={`/orders/${id}`}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
            
            {/* Desktop Sign In/Up Links */}
            <SignedOut>
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  to="/sign-in" 
                  className="hover:text-gray-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link 
                  to="/sign-up" 
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            </SignedOut>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar - Shows below header when toggled */}
        {isSearchOpen && (
          <div className="border-t border-gray-200 py-4 animate-in slide-in-from-top duration-200">
            <ProductSearchForm onClose={() => setIsSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden animate-in slide-in-from-top duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Authentication Links */}
          <div className="block md:hidden px-4 pb-3 border-t border-gray-100 pt-3">
            <SignedOut>
              <div className="flex flex-col gap-2">
                <Link 
                  to="/sign-in"
                  className="block px-3 py-2 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link 
                  to="/sign-up"
                  className="block px-3 py-2 text-base font-medium bg-black text-white text-center rounded-md hover:bg-gray-800 transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import { store } from './lib/store';
import { Provider } from 'react-redux';
import { ClerkProvider } from '@clerk/clerk-react'

// pages 
import HomePage from './pages/home.page.jsx';
import SignUpPage from './pages/sign-up.page.jsx';
import SignInPage from './pages/sign-in.page.jsx';
import ShopPage from './pages/shop.page.jsx';
import CartPage from './pages/cart.page';
import CheckoutPage from './pages/checkout.page.jsx';
// layouts
import RootLayout from './layouts/root.layout.jsx';
import ProtectedLayout from './layouts/protected.layout.jsx';
import CreateProductPage from './pages/admin/create-product-page.jsx';
import EditProductPage from './pages/admin/edit-product-page.jsx';
import AdminDashboardPage from './pages/admin/admin-dashboard.page.jsx';
import AdminProtectedLayout from './layouts/admin-protected.layout';
import AdminDashboardLayout from './layouts/admin-dashboard.layout.jsx';
import ProductsPage from './pages/admin/product-management.page';
import ProductDetailPage from './pages/admin/product-details.page.jsx';


// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop">
                <Route path=":category" element={<ShopPage />} />
                <Route path='cart' element={<CartPage />} />
                <Route element={<ProtectedLayout />}>
                  <Route path="checkout" element={<CheckoutPage />} />
                </Route>
              </Route>
              
              {/* // ✅ CORRECTED ROUTE STRUCTURE */}

              <Route element={<ProtectedLayout />}>
                {/* 🔐 ADMIN ROUTES - Protected by AdminProtectedLayout */}
                <Route element={<AdminProtectedLayout />}>
                  <Route path="/admin" element={<AdminDashboardLayout />}>
                    {/* 📊 Admin Dashboard Home */}
                    <Route index element={<AdminDashboardPage />} />
                    
                    {/* 📦 PRODUCT MANAGEMENT ROUTES */}
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="/admin/products/:id" element={<ProductDetailPage />} />
                    <Route path="products/create" element={<CreateProductPage />} />
                    <Route path="products/edit/:id" element={<EditProductPage />} />
                    
                    {/* 🛒 ORDER MANAGEMENT ROUTES */}
                    {/* <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:id" element={<OrderDetailsPage />} /> */}
                    
                    {/* 👥 CUSTOMER MANAGEMENT ROUTES */}
                    {/* <Route path="customers" element={<CustomersPage />} />
                    <Route path="customers/:id" element={<CustomerDetailsPage />} /> */}
                    
                    {/* ⚙️ SETTINGS ROUTES */}
                    {/* <Route path="settings" element={<SettingsPage />} />
                    <Route path="settings/profile" element={<ProfileSettingsPage />} />
                    <Route path="settings/store" element={<StoreSettingsPage />} /> */}
                  </Route>
                </Route>
              </Route>

              
            </Route>
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </StrictMode>
);

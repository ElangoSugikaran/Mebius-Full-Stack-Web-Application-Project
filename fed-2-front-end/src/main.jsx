import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'

// ✅ ADD THESE TOASTIFY IMPORTS
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

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
import ShopProductDetailPage from './pages/product-details.page.jsx';
import WishlistPage from './pages/wishlist.page';
import PaymentPage from './pages/payment.page';
import PaymentCompletePage from './pages/payment-complete.page';
import MyOrdersPage from './pages/myorder.page';
import OrderDetailsPage from './pages/orderdetails.page';
import OrderSuccessPage from './pages/ordersuccess.page';

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
import CategoriesPage from './pages/admin/category-management.page.jsx';
import CreateCategoryPage from './pages/admin/create-category-page.jsx';
import EditCategoryPage from './pages/admin/edit-category-page.jsx';
import CategoryDetailPage from './pages/admin/category-details.page.jsx';
import OrdersPage from './pages/admin/order-management.page.jsx';
import OrderDetailPage from './pages/admin/order-details.page.jsx';
import CustomerManagementPage from './pages/admin/customer-management.page.jsx';
import SalesDashboard from './pages/admin/admin-sales-dashboard.page.jsx';

// admin side settings 
import StoreSettingsPage from './pages/admin/store-settings.page.jsx';
import PaymentSettingsPage from './pages/admin/payment-settings.page.jsx';


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
                <Route index element={<ShopPage />} />
                <Route path=":category" element={<ShopPage />} />
                <Route path="product-details/:id" element={<ShopProductDetailPage />} />
                <Route path='cart' element={<CartPage />} />
                <Route path='wishlist' element={<WishlistPage />} />
              </Route>
              
              {/* 🔧 FIX: Move orders routes outside of shop and protected routes */}
              <Route element={<ProtectedLayout />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/payment-complete" element={<PaymentCompletePage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                
                {/* 🔧 CUSTOMER ORDER ROUTES - Now at root level */}
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailsPage />} />
              </Route>
              
              {/* 🔐 ADMIN ROUTES */}
              <Route element={<ProtectedLayout />}>
                <Route element={<AdminProtectedLayout />}>
                  <Route path="/admin" element={<AdminDashboardLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="sales" element={<SalesDashboard />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/:id" element={<ProductDetailPage />} />
                    <Route path="products/create" element={<CreateProductPage />} />
                    <Route path="products/edit/:id" element={<EditProductPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="categories/:id" element={<CategoryDetailPage />} />
                    <Route path="categories/create" element={<CreateCategoryPage />} />
                    <Route path="categories/edit/:id" element={<EditCategoryPage />} />
                    <Route path="admin-orders" element={<OrdersPage />} />
                    <Route path="admin-orders/:id" element={<OrderDetailPage />} />
                    <Route path="customers" element={<CustomerManagementPage />} />
                    <Route path="settings/store" element={<StoreSettingsPage />} />
                    <Route path="settings/payment" element={<PaymentSettingsPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>
            
            {/* Auth routes outside RootLayout */}
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
          </Routes>
          
          {/* ✅ ADD TOASTCONTAINER HERE - OUTSIDE ROUTES BUT INSIDE BROWSERROUTER */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </StrictMode>
);
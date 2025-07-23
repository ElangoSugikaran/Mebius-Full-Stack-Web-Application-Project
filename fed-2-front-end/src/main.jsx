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
            </Route>
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </StrictMode>
);

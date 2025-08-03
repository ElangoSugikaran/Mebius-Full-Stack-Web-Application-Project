// import { Button } from "@/components/ui/button"
// import { Link } from "react-router"
// import { useSelector } from "react-redux"
// import CartItem from "@/components/CartItem"

// const CartPage = () => {

//     // Get cart items from Redux store
//     const cart = useSelector((state) => state.cart.cartItems);

//   return (
//      <main className="px-16 min-h-screen py-8">
//       <h2 className="text-4xl font-bold">My Cart</h2>
//       <div className="mt-4 grid grid-cols-2 w-1/2 gap-x-4">
//         {cart.map((item, index) => (
//           <CartItem key={index} item={item} />
//         ))}
//       </div>

//       <div className="mt-4">
//         {cart.length > 0 ? (
//           <Button asChild>
//             <Link to="/shop/checkout">Proceed to Checkout</Link>
//           </Button>
//         ) : (
//           <p>No items in cart</p>
//         )}
//       </div>
//     </main>
//   )
// }

// export default CartPage;


// pages/CartPage.jsx - Enhanced cart page with better UI and functionality
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import CartItem from "@/components/CartItem";
import { ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { updateCartItemQuantity, removeFromCart } from "@/lib/features/cartSlice"; // You'll need these actions

const CartPage = () => {
  const dispatch = useDispatch();
  
  // 📝 LEARNING: Get cart items from Redux store
  const cart = useSelector((state) => state.cart.cartItems);

  // 📝 LEARNING: Calculate cart totals
  const cartSummary = {
    subtotal: cart.reduce((total, item) => {
      const price = item.product.discount > 0 
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0),
    itemCount: cart.reduce((total, item) => total + item.quantity, 0),
    savings: cart.reduce((total, item) => {
      if (item.product.discount > 0) {
        const savings = (item.product.price * item.product.discount / 100) * item.quantity;
        return total + savings;
      }
      return total;
    }, 0)
  };

  const shipping = cartSummary.subtotal > 75 ? 0 : 9.99;
  const tax = cartSummary.subtotal * 0.08; // 8% tax
  const total = cartSummary.subtotal + shipping + tax;

  // 📝 LEARNING: Handle cart actions
  const handleUpdateQuantity = async (productId, newQuantity) => {
    dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  // 📝 LEARNING: Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 📱 BREADCRUMB */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Cart</span>
          </div>

          {/* 🛒 EMPTY CART */}
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
              </p>
              <Button asChild size="lg" className="px-8">
                <Link to="/shop">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* 📱 HEADER & BREADCRUMB */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <span className="text-gray-900">Cart</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shopping Cart
              <Badge variant="secondary" className="ml-3">
                {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'}
              </Badge>
            </h1>
          </div>
          
          <Button variant="outline" asChild>
            <Link to="/shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🛍️ CART ITEMS */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cart Items</h2>
              
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div key={`${item.product._id}-${index}`}>
                    <CartItem 
                      item={item} 
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                    />
                    {index < cart.length - 1 && <hr className="my-6 border-gray-200" />}
                  </div>
                ))}
              </div>
            </Card>

            {/* 🚚 SHIPPING INFO */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Shipping & Returns</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-gray-600">On orders over $75</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-gray-600">100% protected</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-gray-600">30-day policy</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 💰 ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartSummary.itemCount} items)</span>
                  <span>${cartSummary.subtotal.toFixed(2)}</span>
                </div>
                
                {cartSummary.savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Savings</span>
                    <span>-${cartSummary.savings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                    💡 Add ${(75 - cartSummary.subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* 🛒 CHECKOUT BUTTON */}
              <Button asChild size="lg" className="w-full mt-6">
                <Link to="/shop/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Shipping and taxes calculated at checkout
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
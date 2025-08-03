// import { Card } from "@/components/ui/card";

// function CartItem({ item }) {
//   return (
//     <Card className="p-4">
//       <div className="flex items-center space-x-4">
//         <img
//           src={item.product.image || "/placeholder.svg"}
//           alt={item.product.name}
//           className="w-16 h-16 object-cover rounded"
//         />
//         <div className="flex-1">
//           <p className="font-medium">{item.product.name}</p>
//           <p className="text-muted-foreground">${item.product.price}</p>
//           <p className="text-sm">Quantity: {item.quantity}</p>
//         </div>
//       </div>
//     </Card>
//   );
// }

// export default CartItem;

// components/CartItem.jsx - Enhanced cart item with better UI
// components/CartItem.jsx - Fixed with proper type checking
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import { useState } from "react";

function CartItem({ item, onUpdateQuantity, onRemoveItem, viewMode = "default" }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔧 FIX: Safely convert prices to numbers and handle missing values
  const originalPrice = parseFloat(item.product.price) || 0;
  const discount = parseFloat(item.product.discount) || 0;
  const stock = parseInt(item.product.stock) || 0;
  
  // 📝 LEARNING: Calculate prices with proper number handling
  const discountedPrice = discount > 0 
    ? originalPrice * (1 - discount / 100)
    : originalPrice;
  const totalPrice = discountedPrice * quantity;

  // 📝 LEARNING: Handle quantity changes
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    setQuantity(newQuantity);
    
    // Call parent function to update cart in Redux
    if (onUpdateQuantity) {
      await onUpdateQuantity(item.product._id, newQuantity);
    }
    
    setIsUpdating(false);
  };

  // 📝 LEARNING: Handle item removal
  const handleRemove = () => {
    if (onRemoveItem) {
      onRemoveItem(item.product._id);
    }
  };

  // 🔍 DEBUG: Log values to see what's happening (remove this later)
  console.log('CartItem Debug:', {
    originalPrice,
    discount,
    discountedPrice,
    productData: item.product
  });

  // 📝 LEARNING: Compact view for checkout page
  if (viewMode === "compact") {
    return (
      <Card className="p-3 bg-white border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={item.product.image || "/placeholder.svg"}
              alt={item.product.name}
              className="w-12 h-12 object-cover rounded-md"
            />
            {discount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0">
                -{discount}%
              </Badge>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {item.product.name}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm font-semibold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-gray-500">×{quantity}</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // 📝 LEARNING: Default detailed view for cart page
  return (
    <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* 🖼️ PRODUCT IMAGE */}
        <div className="relative flex-shrink-0">
          <img
            src={item.product.image || "/placeholder.svg"}
            alt={item.product.name}
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
          />
          {discount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
              -{discount}%
            </Badge>
          )}
          
          {/* 🔥 STOCK STATUS */}
          {stock < 5 && stock > 0 && (
            <Badge variant="outline" className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-orange-100 text-orange-800 border-orange-300">
              Only {stock} left
            </Badge>
          )}
        </div>

        {/* 📝 PRODUCT INFO */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 leading-tight">
              {item.product.name || 'Unknown Product'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {item.product.brand && `by ${item.product.brand}`}
            </p>
            
            {/* 💰 PRICE SECTION */}
            <div className="flex items-center space-x-3 mt-2">
              <span className="text-xl font-bold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* ⚡ QUANTITY CONTROLS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdating}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                  {isUpdating ? "..." : quantity}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= stock || isUpdating}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 🗑️ ACTION BUTTONS */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-pink-600 hover:bg-pink-50"
              >
                <Heart className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          {/* 💵 TOTAL PRICE */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-lg font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CartItem;
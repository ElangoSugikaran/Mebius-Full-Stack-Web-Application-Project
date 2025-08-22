// components/CartItem.jsx - Fixed version with better error handling
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useAddToWishlistMutation } from "@/lib/api";

// 🔧 FIXED: Better data extraction and error handling
function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem, 
  viewMode = "default",
  isUpdating = false,
  isRemoving = false 
}) {
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [isLocalUpdating, setIsLocalUpdating] = useState(false);
  
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();

// Sync quantity with prop changes
  useEffect(() => {
    if (item?.quantity && item.quantity !== quantity) {
      setQuantity(item.quantity);
    }
  }, [item?.quantity]);

// 🔧 CRITICAL FIX: Handle both server cart format and local cart format
  const product = (() => {
    // Server format: item has productId populated or direct product data
    if (item?.productId && typeof item.productId === 'object') {
      return item.productId; // Populated product
    }
    
    // Server format: item has product data directly
    if (item?.name && item?.price) {
      return item; // Direct product data
    }
    
    // Local format: item.product exists
    if (item?.product) {
      return item.product;
    }
    
    // Fallback
    return item || {};
  })();

  // 🔧 CRITICAL FIX: Safe property access
  const productId = product._id || product.id || item?.productId;
  const productName = product.name || 'Unknown Product';
  const productImage = product.image || product.images?.[0] || '/placeholder-product.jpg';
  const productBrand = product.brand;

  // Safely convert prices to numbers with fallbacks
  const originalPrice = parseFloat(product.price) || 0;
  const discount = parseFloat(product.discount) || 0;
  const stock = parseInt(product.stock) || 999;

  // Calculate prices with proper number handling
  const discountedPrice = discount > 0 
    ? originalPrice * (1 - discount / 100)
    : originalPrice;
  const totalPrice = discountedPrice * quantity;

  // 🔧 CRITICAL FIX: Better quantity handling with proper variant support
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > stock || !productId) {
      console.warn('Invalid quantity or missing product ID:', { newQuantity, stock, productId });
      return;
    }
    
    setIsLocalUpdating(true);
    setQuantity(newQuantity);
    
    try {
      if (onUpdateQuantity) {
        await onUpdateQuantity(
          productId, 
          newQuantity,
          item?.size,
          item?.color
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert quantity on error
      setQuantity(item?.quantity || 1);
    } finally {
      setIsLocalUpdating(false);
    }
  };

  // 🔧 CRITICAL FIX: Better removal with proper variant support
const handleRemove = async () => {
  if (!productId) {
    console.error('Cannot remove item: missing product ID');
    return;
  }

  try {
    if (onRemoveItem) {
      await onRemoveItem(
        productId,
        item?.size,
        item?.color
      );
      
      toast.success('Item removed from cart', {
        position: "top-right",
        autoClose: 2000,
      });
    }
  } catch (error) {
    console.error('Error removing item:', error);
    toast.error('Failed to remove item from cart', {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

// Add this new function for saving to wishlist
const handleSaveToWishlist = async () => {
  if (!productId) {
    console.error('Cannot save to wishlist: missing product ID');
    return;
  }

  try {
    await addToWishlist(productId).unwrap();
    toast.success('Item saved to wishlist', {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error) {
    console.error('Error saving to wishlist:', error);
    toast.error('Failed to save to wishlist', {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

  // Handle image load errors
  const handleImageError = (e) => {
    e.target.src = '/placeholder-product.jpg';
  };

  // Check if any operations are in progress
  const isOperationInProgress = isUpdating || isRemoving || isLocalUpdating;

  // 🔧 IMPROVEMENT: Better error handling for missing data
  if (!productId) {
    console.error('CartItem: Missing product ID', item);
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Error: Invalid cart item data</p>
      </div>
    );
  }

  // Compact view for checkout page
  if (viewMode === "compact") {
    return (
      <Card className="p-3 bg-white border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={productImage}
              alt={productName}
              className="w-12 h-12 object-cover rounded-md"
              onError={handleImageError}
            />
            {discount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0">
                -{discount}%
              </Badge>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {productName}
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
            
            {/* Size & Color for compact view */}
            {(item?.size || item?.color) && (
              <div className="flex gap-1 mt-1">
                {item.size && (
                  <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {item.size}
                  </span>
                )}
                {item.color && (
                  <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {item.color}
                  </span>
                )}
              </div>
            )}
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

  // Default detailed view for cart page
  return (
    <Card className={`p-6 bg-white border border-gray-200 hover:shadow-md transition-all duration-200 ${isOperationInProgress ? 'opacity-75' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* Product Image */}
        <div className="relative flex-shrink-0">
          <img
            src={productImage}
            alt={productName}
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
            onError={handleImageError}
          />
          {discount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
              -{discount}%
            </Badge>
          )}
          
          {/* Stock Status */}
          {stock < 5 && stock > 0 && (
            <Badge variant="outline" className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-orange-100 text-orange-800 border-orange-300 text-xs">
              Only {stock} left
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 leading-tight">
              {productName}
            </h3>
            {productBrand && (
              <p className="text-sm text-gray-600 mt-1">
                by {productBrand}
              </p>
            )}
            
            {/* Size & Color Display */}
            {(item?.size || item?.color) && (
              <div className="flex gap-2 text-sm text-gray-600 mt-1">
                {item.size && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    Size: {item.size}
                  </span>
                )}
                {item.color && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    Color: {item.color}
                  </span>
                )}
              </div>
            )}
            
            {/* Price Section */}
            <div className="flex items-center space-x-3 mt-2">
              <span className="text-xl font-bold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Save ${(originalPrice - discountedPrice).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isOperationInProgress}
                  className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                  {isLocalUpdating ? "..." : quantity}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= stock || isOperationInProgress}
                  className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {stock < 10 && stock > 0 && (
                <span className="text-xs text-orange-600 ml-2">
                  {stock} available
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                onClick={handleRemove}
                disabled={isOperationInProgress}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isRemoving ? "Removing..." : "Remove"}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-pink-600 hover:bg-pink-50"
                disabled={isOperationInProgress || isAddingToWishlist}
                onClick={handleSaveToWishlist}
              >
                <Heart className="h-4 w-4 mr-1" />
                {isAddingToWishlist ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {/* Total Price */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-lg font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            {discount > 0 && quantity > 1 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total savings:</span>
                <span className="text-green-600 font-medium">
                  -${((originalPrice - discountedPrice) * quantity).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CartItem;
// Fixed WishlistItem.jsx - Backend integration
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye, X, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useRemoveFromWishlistMutation, useAddToCartMutation } from "@/lib/api";

function WishlistItem({ item }) {
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  // 🔧 FIX: Handle backend data structure
  // Backend sends: { productId: ObjectId, name, price, image, inStock, etc. }
  const productId = item.productId?._id || item.productId; // Handle populated or unpopulated
  const product = item.productId?.name ? item.productId : item; // If populated, use productId data
  
  const originalPrice = parseFloat(product.price || item.price) || 0;
  const finalPrice = parseFloat(product.finalPrice || item.finalPrice || originalPrice) || 0;
  const stock = product.stock || (item.inStock ? 1 : 0);
  
  // Handle removal
  const handleRemove = async () => {
    try {
      await removeFromWishlist(productId).unwrap();
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  // Handle move to cart
  const handleMoveToCart = async () => {
    if (stock > 0) {
      try {
        await addToCart({
          productId: productId,
          quantity: 1
        }).unwrap();
        
        // Remove from wishlist after successful cart add
        await removeFromWishlist(productId).unwrap();
      } catch (error) {
        console.error('Failed to move to cart:', error);
      }
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <Link to={`/shop/product/${productId}`}>
            <img
              src={product.image || item.image || "/placeholder.svg"}
              alt={product.name || item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = '/placeholder.svg';
              }}
            />
          </Link>
          
          {/* Out of Stock Overlay */}
          {!item.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-gray-900 text-white px-3 py-1">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Remove Button */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3 w-8 h-8 rounded-full p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <Link to={`/shop/product/${productId}`}>
            <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2 text-sm">
              {product.name || item.name || 'Unknown Product'}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold text-gray-900">
              ${finalPrice.toFixed(2)}
            </span>
            {finalPrice < originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleMoveToCart}
              disabled={!item.inStock || isAddingToCart}
              className="w-full"
              size="sm"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {!item.inStock ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Move to Cart'}
            </Button>
            
            <div className="flex gap-2">
              <Link to={`/shop/product/${productId}`} className="flex-1">
                <Button variant="outline" className="w-full" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Heart className="h-4 w-4 fill-red-500" />
              </Button>
            </div>
          </div>

          {/* Added Date */}
          {item.addedAt && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Added {new Date(item.addedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default WishlistItem;
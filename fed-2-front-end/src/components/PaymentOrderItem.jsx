import React from 'react';
import { Badge } from "@/components/ui/badge";

function PaymentOrderItem({ item }) {
  const { product, quantity } = item;
  const price = product.finalPrice || product.price;
  const itemTotal = price * quantity;

  return (
    <div className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={product.image || product.thumbnail || '/placeholder-image.png'}
          alt={product.name || product.title}
          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {product.name || product.title}
        </h4>
        
        {/* Product attributes (size, color, etc.) */}
        {product.variant && (
          <p className="text-xs text-gray-500 mt-1">
            {product.variant}
          </p>
        )}
        
        {/* Price per unit */}
        <div className="flex items-center mt-1">
          <span className="text-sm text-gray-600">
            ${price.toFixed(2)} each
          </span>
          {product.originalPrice && product.originalPrice > price && (
            <span className="text-xs text-gray-400 line-through ml-2">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity and Total */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center justify-end mb-1">
          <Badge variant="secondary" className="text-xs">
            Qty: {quantity}
          </Badge>
        </div>
        <div className="text-sm font-semibold text-gray-900">
          ${itemTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default PaymentOrderItem;
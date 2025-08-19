import { Link } from "react-router";
import { useGetAllProductsQuery} from "../lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingBag, Heart, Star, TrendingUp} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/cartSlice";

// 🔥 TRENDING SECTION COMPONENT
function TrendingSection() {
  const { data: products = [] } = useGetAllProductsQuery();
  const dispatch = useDispatch();
  
  // 📊 Get trending products (you can modify this logic based on your needs)
  const trendingProducts = products
    .filter(product => product.averageRating >= 4 || product.discount > 0)
    .slice(0, 8);

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      discount: product.discount || 0,
      originalPrice: product.price,
      image: product.image,
      brand: product.brand,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
    }));
  };

  return (
    <section className="px-4 lg:px-16 py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <span className="text-red-500 font-medium">Trending Now</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Popular Products
          </h2>
          <p className="text-gray-600 mt-2">
            Our most loved items by customers
          </p>
        </div>
        
        <Link to="/shop">
          <Button variant="outline">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((product) => (
          <div key={product._id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* 🖼️ Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* 🏷️ Discount Badge */}
              {product.discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                  -{product.discount}%
                </Badge>
              )}
              
              {/* ❤️ Quick Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button size="sm" variant="secondary" className="w-10 h-10 rounded-full p-0">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* 📝 Product Info */}
            <div className="p-4">
              {/* 🏢 Brand & Rating */}
              <div className="flex items-center justify-between mb-2">
                {product.brand && (
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                )}
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* 📛 Product Name */}
              <Link to={`/shop/product-details/${product._id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              {/* 💰 Price */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {product.discount > 0 ? (
                    <>
                      <span className="text-lg font-bold text-gray-900">
                        ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* 🛒 Add to Cart Button */}
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
                disabled={product.stock === 0}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrendingSection;
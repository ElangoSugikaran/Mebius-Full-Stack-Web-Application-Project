// Updated ProductDetail component with better cart handling and review functionality
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/cartSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import { toast } from 'react-toastify';
import { 
  useGetProductByIdQuery, 
  useGetProductReviewsQuery, 
  useAddToCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '../lib/api';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Edit3
} from "lucide-react";

const ShopProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { 
    data: product, 
    isLoading: productLoading, 
    error: productError 
  } = useGetProductByIdQuery(id);
  
  const { 
    data: reviews = [], 
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews
  } = useGetProductReviewsQuery(id);

    // 🔧 ADD THESE WISHLIST HOOKS
  const { data: wishlist = [], isLoading: wishlistLoading } = useGetWishlistQuery();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();

  const [addToCartMutation] = useAddToCartMutation();

  // Component state
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  const calculateFinalPrice = (price, discount) => {
    if (!discount || discount === 0) return price;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  // 🔧 Improved add to cart with better error handling
  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      // Always update Redux state first for immediate UI feedback
      dispatch(addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        originalPrice: product.price,
        image: product.images ? product.images[0] : product.image,
        brand: product.brand,
        sizes: product.sizes,
        colors: product.colors,
        stock: product.stock,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
      }));

      // Try to sync with server (this will gracefully fail if endpoint doesn't exist)
      try {
        await addToCartMutation({
          productId: product._id,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor,
        }).unwrap();
        
        console.log('✅ Product synced with server cart');
      } catch (serverError) {
        // Server sync failed, but Redux state is already updated
        console.warn('⚠️ Server sync failed, using local cart only:', serverError);
      }

      // Show success feedback
      // alert(`Added ${quantity} item(s) to cart!`);
       // Show success toast instead of alert
      toast.success(`Added ${quantity} ${product.name} to cart!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      // Even if there's an error, the Redux state should be updated
       toast.error('Failed to add item to cart. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 🔧 ADD THIS HELPER FUNCTION
  const isInWishlist = () => {
    if (!wishlist || !Array.isArray(wishlist) || !product?._id) return false;
    return wishlist.some(item => {
      const itemId = item.productId?._id || item.productId || item._id;
      return itemId === product._id;
    });
  };

  // 🔧 ADD THIS WISHLIST HANDLER
  const handleWishlistToggle = async () => {
    if (!product?._id || isAddingToWishlist || isRemovingFromWishlist) return;

    try {
      if (isInWishlist()) {
        await removeFromWishlist(product._id).unwrap();
        console.log('✅ Removed from wishlist:', product.name);
        toast.info(`💔 Removed ${product.name} from wishlist`, {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        await addToWishlist(product._id).unwrap();
        console.log('✅ Added to wishlist:', product.name);
         toast.success(`❤️ Added ${product.name} to wishlist!`, {
        position: "top-right",
        autoClose: 2000,
      });
      }
    } catch (error) {
      console.error('❌ Wishlist error:', error);
        if (error.status === 401) {
        toast.warn('⚠️ Please log in to use wishlist', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error('❌ Wishlist action failed. Please try again.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleReviewSubmitted = (newReview) => {
    refetchReviews();
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/shop">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const productImages = product.images || [product.image];
  const averageRating = calculateAverageRating(reviews);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gray-900">Shop</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`
                      flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors
                      ${selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              {product.brand && (
                <Badge variant="outline">{product.brand}</Badge>
              )}
              <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {averageRating} ({reviews.length} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {product.discount > 0 ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    ${calculateFinalPrice(product.price, product.discount)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge className="bg-red-500">-{product.discount}%</Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Size</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        px-4 py-2 border-2 rounded-md font-medium transition-colors
                        ${selectedSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`
                        flex items-center gap-2 px-3 py-2 border-2 rounded-md transition-colors
                        ${selectedColor === color
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      <span className="text-sm font-medium">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="font-semibold">Quantity</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className="flex-1"
                size="lg"
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              
             {/* 🔧 UPDATED: Wishlist Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist || isRemovingFromWishlist || wishlistLoading}
                className={`px-4 ${
                  isInWishlist() 
                    ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {isAddingToWishlist || isRemovingFromWishlist ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                ) : (
                  <Heart className={`h-5 w-5 ${
                    isInWishlist() ? 'fill-red-500 text-red-500' : ''
                  }`} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details & Reviews Tabs */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specifications Tab */}
         <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">General</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Brand:</dt>
                        <dd className="font-medium">{product.brand || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between"> 
                        <dt className="text-gray-600">Category:</dt>
                        <dd className="font-medium capitalize">{product.categoryId?.name || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">SKU:</dt>
                        <dd className="font-medium">{product.sku || product._id}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Availability</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Stock:</dt>
                        <dd className="font-medium">{product.stock} units</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Sizes:</dt>
                        <dd className="font-medium">
                          {product.sizes ? product.sizes.join(', ') : 'N/A'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Colors:</dt>
                        <dd className="font-medium">
                          {product.colors ? product.colors.join(', ') : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              
              {/* Reviews Summary & Write Review Button */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Customer Reviews</CardTitle>
                    <Button 
                      onClick={() => setShowReviewForm(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Write a Review
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{averageRating}</div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(averageRating) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{reviews.length} reviews</div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviews.filter(review => review.rating === stars).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        
                        return (
                          <div key={stars} className="flex items-center gap-3 mb-1">
                            <span className="text-sm w-8">{stars}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2">Loading reviews...</span>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
                      <Button onClick={() => setShowReviewForm(true)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Write the First Review
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Form Modal */}
        <ReviewForm
          productId={id}
          isVisible={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>
    </div>
  );
};

export default ShopProductDetailPage;
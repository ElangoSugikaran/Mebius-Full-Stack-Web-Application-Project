// Updated ProductDetail component with Review Form
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useGetProductByIdQuery, useGetProductReviewsQuery} from '../lib/api';
import { addToCart } from "@/lib/features/cartSlice";
import { 
  addToWishlist, 
  removeFromWishlist, 
  selectIsInWishlist 
} from "@/lib/features/wishlistSlice"; // 👈 ADD THIS LINE
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm"; // Import the new component
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
  Edit3 // Add edit icon for review button
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
    refetch: refetchReviews // Add refetch function
  } = useGetProductReviewsQuery(id);

  // Component state
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  // WITH THIS LINE:
  const isWishlisted = useSelector(state => selectIsInWishlist(state, product?._id)); // ✅ ADD THIS
  const [showReviewForm, setShowReviewForm] = useState(false); // NEW: Review form visibility

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

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.discount > 0 ? calculateFinalPrice(product.price, product.discount) : product.price,
        originalPrice: product.price,
        image: product.images ? product.images[0] : product.image,
        brand: product.brand,
        selectedSize,
        selectedColor,
        quantity,
      })
    );

    alert(`Added ${quantity} item(s) to cart!`);
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // NEW: Handle review form submission
  const handleReviewSubmitted = (newReview) => {
    refetchReviews(); // Refresh reviews after new submission
  };

  // 3️⃣ ADD THIS NEW FUNCTION (replace any existing wishlist toggle):
  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product));
    }
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
                disabled={product.stock === 0}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              
              {/* // 4️⃣ UPDATE YOUR WISHLIST BUTTON (find this button and update it): */}
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlistToggle}
                className={`px-4 ${isWishlisted ? 'border-red-200 bg-red-50' : ''}`}
              >
                <Heart 
                  className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Free Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">2-Year Warranty</span>
              </div>
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
                        <dd className="font-medium">{product.category || 'N/A'}</dd>
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
// 🔧 FIXED: Complete MyOrdersPage with proper error handling
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetUserOrdersQuery } from '@/lib/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/clerk-react";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowLeft,
  Eye,
  CreditCard,
  Banknote,
  Calendar,
  AlertCircle,
  RefreshCw,
  ImageIcon,
  ShoppingBag,
  Heart
} from 'lucide-react';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // 🔧 FIX: Get user data from Clerk
  const { user, isSignedIn, isLoaded } = useUser();
  
  // 🔄 Fetch user's orders using RTK Query
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useGetUserOrdersQuery(undefined, {
    // 🔧 FIX: Only fetch orders when user is signed in
    skip: !isSignedIn || !user?.id
  });

  // 🛡️ Enhanced orders processing
  const orders = useMemo(() => {
    if (!data) return [];
    
    try {
      if (Array.isArray(data)) return data;
      if (data.orders && Array.isArray(data.orders)) return data.orders;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.success && data.orders && Array.isArray(data.orders)) return data.orders;
      
      console.warn('Unexpected orders data structure:', data);
      return [];
    } catch (err) {
      console.error('Error processing orders data:', err);
      return [];
    }
  }, [data]);

  // 🎨 Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      'PENDING': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending',
        description: 'Order is being processed'
      },
      'CONFIRMED': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        label: 'Confirmed',
        description: 'Order confirmed and being prepared'
      },
      'SHIPPED': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Truck,
        label: 'Shipped',
        description: 'Order is on its way'
      },
      'FULFILLED': { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Delivered',
        description: 'Order successfully delivered'
      },
      'CANCELLED': { 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Cancelled',
        description: 'Order has been cancelled'
      }
    };
    return configs[status] || configs['PENDING'];
  };

  // 💳 Payment configuration
  const getPaymentConfig = (method, status) => {
    const paymentMethods = {
      'COD': {
        icon: Banknote,
        label: 'Cash on Delivery',
        color: status === 'PAID' ? 'text-green-600' : 'text-orange-600'
      },
      'CREDIT_CARD': {
        icon: CreditCard,
        label: 'Credit Card',
        color: status === 'PAID' ? 'text-green-600' : 'text-blue-600'
      },
      'STRIPE': {
        icon: CreditCard,
        label: 'Online Payment',
        color: status === 'PAID' ? 'text-green-600' : 'text-blue-600'
      }
    };
    
    return paymentMethods[method] || paymentMethods['CREDIT_CARD'];
  };

  // 🖼️ Product image component
  const ProductImage = ({ src, alt, className = '' }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div className={`relative ${className}`}>
        {!imageError && src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover rounded"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  // 🔍 Enhanced filtering
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    try {
      return selectedStatus === 'ALL' 
        ? orders.filter(order => order && order._id)
        : orders.filter(order => 
            order && 
            order._id && 
            order.orderStatus === selectedStatus
          );
    } catch (err) {
      console.error('Error filtering orders:', err);
      return [];
    }
  }, [orders, selectedStatus]);

  // 📅 Date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date error';
    }
  };

  // 🔄 Order again functionality
  const handleOrderAgain = async (order) => {
    try {
      if (!order?.items?.length) {
        alert('No items found in this order');
        return;
      }

      console.log('Order again clicked for order:', order._id);
      
      const cartItems = order.items
        .filter(item => item.productId && item.quantity > 0)
        .map(item => ({
          productId: item.productId._id || item.productId,
          quantity: item.quantity,
          price: item.price
        }));
      
      if (cartItems.length > 0) {
        alert(`Would add ${cartItems.length} items to cart (implementation pending)`);
      } else {
        alert('No valid items found to add to cart');
      }
    } catch (error) {
      console.error('Error processing order again:', error);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  // 🔧 NEW: Enhanced empty state component
  const EmptyOrdersState = ({ selectedStatus }) => (
    <Card className="p-12 text-center max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <Package className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {selectedStatus === 'ALL' 
              ? `Welcome ${user?.firstName || 'Customer'}!` 
              : `No ${selectedStatus.toLowerCase()} orders`
            }
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            {selectedStatus === 'ALL' 
              ? "You haven't placed any orders yet. Start exploring our amazing products!"
              : `You don't have any ${selectedStatus.toLowerCase()} orders at the moment.`
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={() => navigate('/shop')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Start Shopping
          </Button>
          
          <Button 
            onClick={() => navigate('/shop/wishlist')}
            variant="outline"
            size="lg"
            className="border-gray-300"
          >
            <Heart className="h-5 w-5 mr-2" />
            View Wishlist
          </Button>
        </div>

        {selectedStatus === 'ALL' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              What you can do:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <ShoppingBag className="h-8 w-8 text-blue-600 mb-2" />
                <h5 className="font-medium text-gray-900">Browse Products</h5>
                <p className="text-gray-600 text-center">Explore our wide range of quality products</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Heart className="h-8 w-8 text-red-600 mb-2" />
                <h5 className="font-medium text-gray-900">Save Favorites</h5>
                <p className="text-gray-600 text-center">Add items to your wishlist for later</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Package className="h-8 w-8 text-green-600 mb-2" />
                <h5 className="font-medium text-gray-900">Track Orders</h5>
                <p className="text-gray-600 text-center">Monitor your purchases in real-time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  // Loading state
  if (!isLoaded || (isSignedIn && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your order history.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/sign-in')}
              className="w-full"
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/shop')}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load orders</h2>
          <p className="text-gray-600 mb-4">
            {error?.data?.message || error?.message || 'Something went wrong while fetching your orders'}
          </p>
          <div className="space-y-2">
            <Button onClick={refetch} disabled={isFetching}>
              {isFetching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                'Try Again'
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-blue-600 transition-colors"
              type="button"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-gray-900">My Orders</span>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600">
                  {orders.length > 0 
                    ? `You have ${orders.length} order${orders.length !== 1 ? 's' : ''}`
                    : 'Your order history will appear here'
                  }
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={refetch} 
                disabled={isFetching}
                size="sm"
              >
                {isFetching ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate('/shop')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>

        {/* Filter tabs - only show when there are orders */}
        {orders.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'FULFILLED', 'CANCELLED'].map((status) => {
                const statusCount = status === 'ALL' 
                  ? orders.length 
                  : orders.filter(order => order?.orderStatus === status).length;
                
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                    type="button"
                  >
                    {status === 'ALL' ? 'All Orders' : status}
                    {statusCount > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        selectedStatus === status 
                          ? 'bg-white bg-opacity-20' 
                          : 'bg-gray-100'
                      }`}>
                        {statusCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders List or Empty State */}
        {filteredOrders.length === 0 ? (
          <EmptyOrdersState selectedStatus={selectedStatus} />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              if (!order?._id) return null;
              
              const statusConfig = getStatusConfig(order.orderStatus);
              const paymentConfig = getPaymentConfig(order.paymentMethod, order.paymentStatus);
              const StatusIcon = statusConfig.icon;
              const PaymentIcon = paymentConfig.icon;

              return (
                <Card key={order._id} className="p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          Order #{order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                        </h3>
                        <Badge className={`${statusConfig.color} px-3 py-1 text-sm`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </div>
                        
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                        
                        <div className={`flex items-center ${paymentConfig.color}`}>
                          <PaymentIcon className="h-4 w-4 mr-1" />
                          {paymentConfig.label}
                        </div>
                        
                        {order.paymentStatus === 'PAID' && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Paid
                          </Badge>
                        )}
                      </div>
                      
                      {/* Order Total */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            ${(order.totalAmount || 0).toFixed(2)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {statusConfig.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <Link to={`/orders/${order._id}`}>
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      
                      {order.orderStatus === 'FULFILLED' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleOrderAgain(order)}
                          type="button"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Order Again
                        </Button>
                      )}
                      
                      {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && 
                        order.orderStatus !== 'CANCELLED' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            const confirmCancel = window.confirm(
                              `Are you sure you want to cancel order #${order._id?.slice(-8)?.toUpperCase()}?`
                            );
                            if (confirmCancel) {
                              alert('Cancel order functionality will be implemented with backend integration');
                            }
                          }}
                          type="button"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {order.items.slice(0, 6).map((item, index) => {
                          const productName = item.productId?.name || item.productName || 'Unknown Product';
                          const quantity = item.quantity || 0;
                          const price = item.price || 0;
                          const imageUrl = item.productId?.images?.[0]?.url || 
                                          item.productId?.image || 
                                          item.productImage || 
                                          item.image;
                          
                          return (
                            <div 
                              key={`${item.productId?._id || item.productId || index}`} 
                              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                            >
                              <ProductImage
                                src={imageUrl}
                                alt={productName}
                                className="w-12 h-12 flex-shrink-0"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-gray-900 truncate">
                                  {productName}
                                </h5>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-600">
                                    Qty: {quantity}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    ${price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {order.items.length > 6 && (
                          <div className="flex items-center justify-center p-3 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                            <div className="text-center">
                              <Package className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                              <span className="text-xs text-gray-500">
                                +{order.items.length - 6} more item{order.items.length - 6 !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Refresh Section */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Last updated: {new Date().toLocaleString()}
            </p>
            <Button 
              variant="outline" 
              onClick={refetch} 
              disabled={isFetching}
            >
              {isFetching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                'Refresh Orders'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
// 🔧 FIXED: Enhanced empty state handling for authenticated users
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

  // 🔧 NEW: Enhanced empty state component for authenticated users
  const EmptyOrdersState = ({ selectedStatus }) => (
    <Card className="p-12 text-center max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Icon and Welcome Message */}
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

        {/* Call to Action Buttons */}
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

        {/* Feature Highlights for New Users */}
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

  // 🔄 Loading state - Show loading only when user is authenticated
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

  // 🔐 Not signed in state
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

  // ❌ Enhanced error state
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

        {/* 🔧 FIXED: Show filter tabs only when there are orders */}
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

        {/* 📦 Orders List or Empty State */}
        {filteredOrders.length === 0 ? (
          <EmptyOrdersState selectedStatus={selectedStatus} />
        ) : (
          <div className="space-y-4">
            {/* Your existing orders rendering code goes here */}
            {/* This remains the same as your original implementation */}
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
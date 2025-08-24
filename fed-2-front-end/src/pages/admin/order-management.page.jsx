// File: src/pages/admin/OrdersPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Search, 
  Eye,
  MoreHorizontal,
  ShoppingCart,
  Filter,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertTriangle,  // 🔧 Add this
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '@/lib/api';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // 🔧 FIXED: Better API data handling with proper data extraction
  const { data: apiResponse, isLoading, error, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();


  // 🔧 STEP 1: Use useMemo to safely extract orders and prevent unnecessary re-renders
  const orders = useMemo(() => {
    if (!apiResponse) {
      console.log('📡 API Response is null/undefined');
      return [];
    }

    // Handle different API response formats
    if (Array.isArray(apiResponse)) {
      console.log('📡 API returned array directly:', apiResponse.length, 'orders');
      return apiResponse;
    }

    if (apiResponse.orders && Array.isArray(apiResponse.orders)) {
      console.log('📡 API returned object with orders array:', apiResponse.orders.length, 'orders');
      return apiResponse.orders;
    }

    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      console.log('📡 API returned object with data array:', apiResponse.data.length, 'orders');
      return apiResponse.data;
    }

    console.warn('📡 Unexpected API response format:', apiResponse);
    return [];
  }, [apiResponse]);

  // 🔧 STEP 2: Use useMemo for order statistics to prevent recalculation
  const orderStats = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return {
        total: 0,
        pending: 0,
        shipped: 0,
        fulfilled: 0,
        cancelled: 0,
        totalRevenue: 0
      };
    }

    const stats = {
      total: orders.length,
      pending: orders.filter(order => order?.orderStatus === 'PENDING').length,
      shipped: orders.filter(order => order?.orderStatus === 'SHIPPED').length,
      fulfilled: orders.filter(order => order?.orderStatus === 'FULFILLED').length,
      cancelled: orders.filter(order => order?.orderStatus === 'CANCELLED').length,
      totalRevenue: 0
    };

    // Calculate total revenue safely
    stats.totalRevenue = orders
      .filter(order => order?.paymentStatus === 'PAID')
      .reduce((total, order) => {
        if (!order?.items || !Array.isArray(order.items)) {
          console.warn('⚠️ Order missing items array:', order);
          return total;
        }

        const orderTotal = order.items.reduce((sum, item) => {
          if (!item?.productId || typeof item.productId !== 'object') {
            // Use item price as fallback if productId is not populated
            return sum + ((item?.price || 0) * (item?.quantity || 0));
          }
          
          const price = (item.productId.discount || 0) > 0 
            ? (item.productId.price || 0) * (1 - (item.productId.discount || 0) / 100)
            : (item.productId.price || 0);
          return sum + (price * (item.quantity || 0));
        }, 0);
        return total + orderTotal;
      }, 0);

    return stats;
  }, [orders]);

  // 🔧 STEP 3: Use useMemo for filtered orders
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    return orders.filter(order => {
      if (!order) return false;

      const matchesSearch = 
        (order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.userId || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // 🔧 STEP 4: Add debug logging with proper dependency
  console.log('🛍️ Orders state:', {
    isLoading,
    error: error?.message,
    apiResponse: !!apiResponse,
    ordersLength: orders.length,
    isArray: Array.isArray(orders),
    filteredLength: filteredOrders.length
  });

    useEffect(() => {
    if (orders.length > 0) {
      console.log('🔍 Orders Debug:', {
        totalOrders: orders.length,
        sampleOrder: orders[0],
        sampleUserInfo: orders[0]?.userInfo,
        allOrdersHaveUserInfo: orders.every(order => !!order.userInfo),
        ordersWithErrors: orders.filter(order => order.userInfo?.isClerkError).length
      });
      
      // Log first few orders' user info
      orders.slice(0, 3).forEach((order, index) => {
        console.log(`📋 Order ${index + 1} User Info:`, {
          orderId: order._id?.slice(-8),
          hasUserInfo: !!order.userInfo,
          userFullName: order.userInfo?.fullName,
          userEmail: order.userInfo?.email,
          isError: order.userInfo?.isClerkError,
          errorReason: order.userInfo?.errorReason
        });
      });
    }
  }, [orders]);

  // 🚀 Handle order status update - FIXED: Better parameter passing and error handling
  const handleStatusUpdate = async (orderId, newStatus, orderNumber) => {
    // 🔧 Enhanced validation
    if (!orderId || orderId === 'undefined' || orderId === 'null' || orderId === '') {
      console.error('❌ Invalid orderId:', orderId);
      toast.error('Invalid order ID. Please refresh the page.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (!newStatus) {
      console.error('❌ Missing status:', newStatus);
      toast.error('Status is required.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    console.log('🔄 Admin updating order status:', { 
      orderId, 
      newStatus, 
      orderNumber,
      orderIdType: typeof orderId
    });
    
    try {
      // 🔧 FIXED: Send parameters in the exact format the API expects
      const result = await updateOrderStatus({ 
        orderId: orderId.toString(), // Ensure it's a string
        status: newStatus,
        orderStatus: newStatus // Include both for compatibility
      }).unwrap();
      
      console.log('✅ Status update successful:', result);
      
      toast.success(`Order #${orderNumber} status updated to ${newStatus}!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // 🔧 Refresh data after successful update
      refetch();
      
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      
      // 🔧 More detailed error messages
      let errorMessage = 'Failed to update order status. Please try again.';
      
      if (error.status === 404) {
        errorMessage = 'Order not found. It may have been deleted.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // 🎨 Status badge styling
  const getOrderStatusBadge = (status) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-purple-100 text-purple-800 border-purple-200',
      SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
      FULFILLED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const icons = {
      PENDING: <Clock className="h-3 w-3 mr-1" />,
      CONFIRMED: <CheckCircle className="h-3 w-3 mr-1" />,
      SHIPPED: <Truck className="h-3 w-3 mr-1" />,
      FULFILLED: <CheckCircle className="h-3 w-3 mr-1" />,
      CANCELLED: <XCircle className="h-3 w-3 mr-1" />
    };

    return (
      <Badge 
        variant="outline" 
        className={`${variants[status]} font-medium flex items-center`}
      >
        {icons[status]}
        {status}
      </Badge>
    );
  };

  // 🎨 Payment status badge styling
  const getPaymentStatusBadge = (status) => {
    const variants = {
      PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge 
        variant="outline" 
        className={`${variants[status]} font-medium`}
      >
        {status}
      </Badge>
    );
  };

  // 💰 Calculate order total with enhanced safety checks
  const calculateOrderTotal = (items) => {
    if (!Array.isArray(items)) {
      console.warn('⚠️ calculateOrderTotal received non-array:', items);
      return 0;
    }

    return items.reduce((total, item) => {
      if (!item?.productId) {
        console.warn('⚠️ Item missing productId:', item);
        // Use the price from the item itself as fallback
        return total + ((item?.price || 0) * (item?.quantity || 0));
      }

      // Handle both populated and non-populated productId
      const product = typeof item.productId === 'object' ? item.productId : null;
      
      if (!product) {
        console.warn('⚠️ Product not populated for item:', item);
        // Use the price from the item itself as fallback
        return total + ((item?.price || 0) * (item?.quantity || 0));
      }
      
      const price = (product.discount || 0) > 0 
        ? (product.price || 0) * (1 - (product.discount || 0) / 100)
        : (product.price || 0);
      return total + (price * (item?.quantity || 0));
    }, 0);
  };

  // 🔧 STEP 5: Better loading state with early return
  if (isLoading) {
    return (
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔧 STEP 6: Better error handling
  if (error) {
    return (
      <div className="container mx-auto px-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Orders</h3>
            <p className="text-red-600 mb-4">
              {error?.data?.message || error?.message || 'Failed to load orders'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6">
      
      {/* 📋 HEADER SECTION */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="mr-3 h-8 w-8" />
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage customer orders, track shipments, and process payments
            </p>
          </div>
        </div>
      </div>

      {/* 📊 STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orderStats.shipped}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.fulfilled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${orderStats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="FULFILLED">Fulfilled</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 📊 ORDERS TABLE */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              // Safety check for each order
              if (!order) return null;

              return (
                <TableRow key={order._id || Math.random()}>
                  
                  {/* 🔗 ORDER ID */}
                  <TableCell>
                    <div className="font-medium text-blue-600">
                      #{(order._id || '').slice(-8).toUpperCase()}
                    </div>
                  </TableCell>
                  
                  {/* 👤 CUSTOMER - Enhanced with better error handling */}
                  <TableCell>
                    <div className="space-y-1">
                      {order.userInfo && !order.userInfo.isClerkError ? (
                        <>
                          <div className="flex items-center space-x-2">
                            {order.userInfo.imageUrl ? (
                              <img 
                                src={order.userInfo.imageUrl} 
                                alt={order.userInfo.fullName || 'User'}
                                className="h-6 w-6 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <User 
                              className="h-4 w-4 text-gray-400" 
                              style={{display: order.userInfo.imageUrl ? 'none' : 'flex'}} 
                            />
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {order.userInfo.fullName || `${order.userInfo.firstName || ''} ${order.userInfo.lastName || ''}`.trim() || 'Unknown User'}
                            </span>
                          </div>
                          {order.userInfo.email && 
                          order.userInfo.email !== 'No email available' && 
                          order.userInfo.email !== 'Error fetching email' && (
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {order.userInfo.email}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {order.userInfo?.isClerkError ? (
                                <span className="text-orange-600 flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  User Info Error
                                </span>
                              ) : (
                                `ID: ${(order.userId || '').slice(-8)}`
                              )}
                            </span>
                          </div>
                          {order.userInfo?.isClerkError && (
                            <p className="text-xs text-orange-500">
                              {order.userInfo.errorReason || 'Clerk API Error'}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>

                  
                  {/* 📦 ITEMS COUNT */}
                  <TableCell>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="font-medium">
                        {Array.isArray(order.items) 
                          ? order.items.reduce((total, item) => total + (item.quantity || 0), 0)
                          : 0
                        } items
                      </span>
                    </div>
                  </TableCell>
                  
                  {/* 💰 TOTAL */}
                  <TableCell>
                    <span className="font-bold text-gray-900">
                      ${calculateOrderTotal(order.items || []).toFixed(2)}
                    </span>
                  </TableCell>
                  
                  {/* 💳 PAYMENT METHOD */}
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {(order.paymentMethod || 'UNKNOWN') === 'COD' ? 'Cash on Delivery' : 'Credit Card'}
                    </Badge>
                  </TableCell>
                  
                  {/* 💰 PAYMENT STATUS */}
                  <TableCell>
                    {getPaymentStatusBadge(order.paymentStatus || 'PENDING')}
                  </TableCell>
                  
                  {/* 📊 ORDER STATUS */}
                  <TableCell>
                    {getOrderStatusBadge(order.orderStatus || 'PENDING')}
                  </TableCell>
                  
                  {/* 📅 DATE */}
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </TableCell>
                  
                  {/* ⚙️ ACTIONS */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/admin-orders/${order._id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                       {/* // For "Mark as Shipped" */}
                      <DropdownMenuItem 
                        onClick={() => {
                          console.log('🔄 Marking as shipped:', { 
                            orderId: order._id, 
                            orderIdExists: !!order._id,
                            orderIdType: typeof order._id 
                          });
                          handleStatusUpdate(
                            order._id, 
                            'SHIPPED', 
                            (order._id || '').slice(-8).toUpperCase()
                          );
                        }}
                        disabled={isUpdating}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Mark as Shipped
                      </DropdownMenuItem>

                      {/* // For "Mark as Fulfilled"   */}
                      <DropdownMenuItem 
                        onClick={() => {
                          console.log('🔄 Marking as fulfilled:', {
                            orderId: order._id,
                            orderIdExists: !!order._id,
                            orderIdType: typeof order._id
                          });
                          handleStatusUpdate(
                            order._id, 
                            'FULFILLED', 
                            (order._id || '').slice(-8).toUpperCase()
                          );
                        }}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Fulfilled
                      </DropdownMenuItem>

                      {/* // For "Confirm Order" */}
                      <DropdownMenuItem 
                        onClick={() => {
                          console.log('🔄 Confirming order:', {
                            orderId: order._id,
                            orderIdExists: !!order._id,
                            orderIdType: typeof order._id
                          });
                          handleStatusUpdate(
                            order._id, 
                            'CONFIRMED', 
                            (order._id || '').slice(-8).toUpperCase()
                          );
                        }}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm Order
                      </DropdownMenuItem>

                      {/* // For "Cancel Order" */}
                      <DropdownMenuItem 
                        onClick={() => {
                          console.log('🔄 Cancelling order:', {
                            orderId: order._id,
                            orderIdExists: !!order._id,
                            orderIdType: typeof order._id
                          });
                          handleStatusUpdate(
                            order._id, 
                            'CANCELLED', 
                            (order._id || '').slice(-8).toUpperCase()
                          );
                        }}
                        disabled={isUpdating}
                        className="text-red-600 focus:text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Order
                      </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* 📄 EMPTY STATE */}
        {filteredOrders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Orders will appear here when customers make purchases'
              }
            </p>
          </div>
        )}
      </div>

      {/* 📊 PAGINATION INFO */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
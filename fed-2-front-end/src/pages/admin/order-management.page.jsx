// File: src/pages/admin/order-management.page.jsx
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
  AlertTriangle,
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

  // API hooks with proper error handling
  const { data: apiResponse, isLoading, error, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  // 🔧 FIXED: Extract orders safely from API response
  const orders = useMemo(() => {
    if (!apiResponse) {
      console.log('❌ No API response received');
      return [];
    }

    console.log('📦 Raw API Response:', apiResponse);

    // Handle different API response formats
    let extractedOrders = [];
    
    if (Array.isArray(apiResponse)) {
      extractedOrders = apiResponse;
    } else if (apiResponse.orders && Array.isArray(apiResponse.orders)) {
      extractedOrders = apiResponse.orders;
    } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
      extractedOrders = apiResponse.data;
    } else if (apiResponse.success && apiResponse.orders) {
      extractedOrders = apiResponse.orders;
    } else {
      console.warn('⚠️ Unexpected API response format:', apiResponse);
      return [];
    }

    console.log(`✅ Extracted ${extractedOrders.length} orders from API response`);
    
    // 🔧 IMPORTANT: Log user info for debugging
    if (extractedOrders.length > 0) {
      console.log('🔍 First order user info check:', {
        orderId: extractedOrders[0]._id?.slice(-8),
        userId: extractedOrders[0].userId?.slice(-8),
        hasUserInfo: !!extractedOrders[0].userInfo,
        userInfo: extractedOrders[0].userInfo,
        isClerkError: extractedOrders[0].userInfo?.isClerkError
      });
    }

    return extractedOrders;
  }, [apiResponse]);

  // Calculate order statistics
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
          return total;
        }

        const orderTotal = order.items.reduce((sum, item) => {
          if (!item?.productId || typeof item.productId !== 'object') {
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

  // Filter orders based on search and filter criteria
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    return orders.filter(order => {
      if (!order) return false;

      // 🔧 FIXED: Enhanced search that includes user info
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        // Order ID search
        (order._id || '').toLowerCase().includes(searchLower) ||
        // User ID search (fallback)
        (order.userId || '').toLowerCase().includes(searchLower) ||
        // User name search (if user info is available)
        (order.userInfo?.fullName || '').toLowerCase().includes(searchLower) ||
        (order.userInfo?.firstName || '').toLowerCase().includes(searchLower) ||
        (order.userInfo?.lastName || '').toLowerCase().includes(searchLower) ||
        // Email search (if available)
        (order.userInfo?.email || '').toLowerCase().includes(searchLower) ||
        // Shipping address name search
        (order.addressId?.firstName || '').toLowerCase().includes(searchLower) ||
        (order.addressId?.lastName || '').toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Debug logging for development
  useEffect(() => {
    if (orders.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('📊 Orders Debug Summary:', {
        totalOrders: orders.length,
        sampleOrder: orders[0],
        sampleUserInfo: orders[0]?.userInfo,
        allOrdersHaveUserInfo: orders.every(order => !!order.userInfo),
        ordersWithUserInfoSuccess: orders.filter(order => order.userInfo && !order.userInfo.isClerkError).length,
        ordersWithUserInfoErrors: orders.filter(order => order.userInfo?.isClerkError).length,
        ordersWithoutUserInfo: orders.filter(order => !order.userInfo).length
      });
      
      // Log detailed user info for first few orders
      orders.slice(0, 3).forEach((order, index) => {
        console.log(`📋 Order ${index + 1} User Details:`, {
          orderId: order._id?.slice(-8),
          hasUserInfo: !!order.userInfo,
          userInfo: order.userInfo ? {
            fullName: order.userInfo.fullName,
            email: order.userInfo.email,
            firstName: order.userInfo.firstName,
            lastName: order.userInfo.lastName,
            imageUrl: order.userInfo.imageUrl,
            isClerkError: order.userInfo.isClerkError,
            errorReason: order.userInfo.errorReason
          } : null
        });
      });
    }
  }, [orders]);

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus, orderNumber) => {
    // Validation
    if (!orderId || orderId === 'undefined' || orderId === 'null' || orderId === '') {
      console.error('Invalid orderId:', orderId);
      toast.error('Invalid order ID. Please refresh the page.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (!newStatus) {
      console.error('Missing status:', newStatus);
      toast.error('Status is required.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    console.log('Admin updating order status:', { 
      orderId, 
      newStatus, 
      orderNumber,
      orderIdType: typeof orderId
    });
    
    try {
      const result = await updateOrderStatus({ 
        orderId: orderId.toString(),
        status: newStatus,
        orderStatus: newStatus
      }).unwrap();
      
      console.log('Status update successful:', result);
      
      toast.success(`Order #${orderNumber} status updated to ${newStatus}!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      refetch();
      
    } catch (error) {
      console.error('Failed to update order status:', error);
      
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
      });
    }
  };

  // Status badge styling
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

  // Payment status badge styling
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

  // Calculate order total with enhanced safety checks
  const calculateOrderTotal = (items) => {
    if (!Array.isArray(items)) {
      console.warn('calculateOrderTotal received non-array:', items);
      return 0;
    }

    return items.reduce((total, item) => {
      if (!item?.productId) {
        return total + ((item?.price || 0) * (item?.quantity || 0));
      }

      const product = typeof item.productId === 'object' ? item.productId : null;
      
      if (!product) {
        return total + ((item?.price || 0) * (item?.quantity || 0));
      }
      
      const price = (product.discount || 0) > 0 
        ? (product.price || 0) * (1 - (product.discount || 0) / 100)
        : (product.price || 0);
      return total + (price * (item?.quantity || 0));
    }, 0);
  };

  // 🔧 FIXED: Enhanced customer display function
  const renderCustomerInfo = (order) => {
    // If we have proper user info from Clerk
    if (order.userInfo && !order.userInfo.isClerkError) {
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {/* User Avatar */}
            {order.userInfo.imageUrl ? (
              <img 
                src={order.userInfo.imageUrl} 
                alt={order.userInfo.fullName || 'User'}
                className="h-6 w-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
              style={{display: order.userInfo.imageUrl ? 'none' : 'flex'}}
            >
              <User className="h-3 w-3 text-blue-600" />
            </div>
            
            {/* User Name */}
            <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
              {order.userInfo.fullName || 
               `${order.userInfo.firstName || ''} ${order.userInfo.lastName || ''}`.trim() || 
               'Unknown User'}
            </span>
          </div>
          
          {/* User Email */}
          {order.userInfo.email && 
           order.userInfo.email !== 'No email available' && 
           order.userInfo.email !== 'Error fetching email' && (
            <p className="text-xs text-gray-500 truncate max-w-[180px] pl-8">
              {order.userInfo.email}
            </p>
          )}
        </div>
      );
    }
    
    // If we have Clerk error
    if (order.userInfo?.isClerkError) {
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-3 w-3 text-orange-600" />
            </div>
            <span className="text-sm text-orange-600 font-medium">
              User Info Error
            </span>
          </div>
          <p className="text-xs text-orange-500 pl-8 truncate max-w-[180px]">
            {order.userInfo.errorReason || 'Clerk API Error'}
          </p>
          <p className="text-xs text-gray-400 pl-8">
            ID: {(order.userId || '').slice(-8).toUpperCase()}
          </p>
        </div>
      );
    }
    
    // Fallback: No user info or fallback to address
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User className="h-3 w-3 text-gray-400" />
          </div>
          
          {/* Try to get name from shipping address if available */}
          {order.addressId?.firstName && order.addressId?.lastName ? (
            <span className="text-sm font-medium text-gray-700">
              {order.addressId.firstName} {order.addressId.lastName}
            </span>
          ) : (
            <span className="text-sm text-gray-600">
              Customer ID: {(order.userId || '').slice(-8).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Phone from address if available */}
        {order.addressId?.phone && (
          <p className="text-xs text-gray-500 pl-8">
            📞 {order.addressId.phone}
          </p>
        )}
      </div>
    );
  };

  // Loading state
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

  // Error state
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
      
      {/* HEADER SECTION */}
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

      {/* STATISTICS CARDS */}
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

      {/* SEARCH & FILTERS */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order ID, customer name, email, or phone..."
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

      {/* ORDERS TABLE */}
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
              if (!order) return null;

              const orderNumber = (order._id || '').slice(-8).toUpperCase();

              return (
                <TableRow key={order._id || Math.random()}>
                  
                  {/* ORDER ID */}
                  <TableCell>
                    <div className="font-medium text-blue-600">
                      #{orderNumber}
                    </div>
                  </TableCell>
                  
                  {/* 🔧 FIXED: CUSTOMER DISPLAY */}
                  <TableCell>
                    {renderCustomerInfo(order)}
                  </TableCell>
                  
                  {/* ITEMS COUNT */}
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
                  
                  {/* TOTAL */}
                  <TableCell>
                    <span className="font-bold text-gray-900">
                      ${calculateOrderTotal(order.items || []).toFixed(2)}
                    </span>
                  </TableCell>
                  
                  {/* PAYMENT METHOD */}
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {(order.paymentMethod || 'UNKNOWN') === 'COD' ? 'Cash on Delivery' : 'Credit Card'}
                    </Badge>
                  </TableCell>
                  
                  {/* PAYMENT STATUS */}
                  <TableCell>
                    {getPaymentStatusBadge(order.paymentStatus || 'PENDING')}
                  </TableCell>
                  
                  {/* ORDER STATUS */}
                  <TableCell>
                    {getOrderStatusBadge(order.orderStatus || 'PENDING')}
                  </TableCell>
                  
                  {/* DATE */}
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </TableCell>
                  
                  {/* ACTIONS */}
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
                        
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order._id, 'SHIPPED', orderNumber)}
                          disabled={isUpdating}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Mark as Shipped
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order._id, 'FULFILLED', orderNumber)}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Fulfilled
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order._id, 'CONFIRMED', orderNumber)}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm Order
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order._id, 'CANCELLED', orderNumber)}
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

        {/* EMPTY STATE */}
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

      {/* PAGINATION INFO */}
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
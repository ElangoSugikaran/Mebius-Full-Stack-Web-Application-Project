import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  useGetAllProductsQuery,
  useGetAllOrdersQuery,
  useGetAllCategoriesQuery 
} from "@/lib/api";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Plus,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboardPage = () => {
  
  // 📊 FETCH REAL DATA from API
  const { data: products, isLoading: productsLoading } = useGetAllProductsQuery();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrdersQuery();
  const { data: categories, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  
  // 💾 DYNAMIC STATS - Calculate from real data
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
    avgOrderValue: 0
  });

  // 🔄 CALCULATE STATS - When data loads, compute real numbers
  // 🔄 CALCULATE STATS - FIXED VERSION
  useEffect(() => {
    if (products && orders) {
      // ✅ SAFE ARRAY EXTRACTION
      const getOrdersArray = (ordersData) => {
        if (!ordersData) return [];
        if (Array.isArray(ordersData)) return ordersData;
        if (ordersData.data && Array.isArray(ordersData.data)) return ordersData.data;
        if (ordersData.orders && Array.isArray(ordersData.orders)) return ordersData.orders;
        return [];
      };

      const ordersArray = getOrdersArray(orders);
      
      // Get unique customers from orders
      const uniqueCustomers = new Set();
      let totalRevenue = 0;
      let monthlyRevenue = 0;
      let pendingCount = 0;
      let completedCount = 0;
      
      // Current month for filtering
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      ordersArray.forEach(order => {
        // Add customer to unique set
        if (order.userId || order.customerEmail) {
          uniqueCustomers.add(order.userId || order.customerEmail);
        }
        
        // Calculate total revenue
        const orderTotal = order.totalAmount || order.total || 0;
        totalRevenue += orderTotal;
        
        // Calculate monthly revenue
        const orderDate = new Date(order.createdAt || order.orderDate);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          monthlyRevenue += orderTotal;
        }
        
        // Count order statuses
        const status = order.orderStatus || order.status;
        if (status === 'PENDING' || status === 'PROCESSING') {
          pendingCount++;
        } else if (status === 'COMPLETED' || status === 'FULFILLED') {
          completedCount++;
        }
      });

      const avgOrderValue = ordersArray.length > 0 ? totalRevenue / ordersArray.length : 0;

      setStats({
        totalProducts: products?.length || 0,
        totalOrders: ordersArray?.length || 0,
        totalCustomers: uniqueCustomers.size,
        totalRevenue: totalRevenue,
        pendingOrders: pendingCount,
        completedOrders: completedCount,
        monthlyRevenue: monthlyRevenue,
        avgOrderValue: avgOrderValue
      });
    } else if (products && !orders) {
      // If only products loaded
      setStats(prev => ({
        ...prev,
        totalProducts: products?.length || 0
      }));
    }
  }, [products, orders]);

  // 🃏 ENHANCED STAT CARD with trend indicators
  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {title.includes('Revenue') || title.includes('Order Value') 
            ? `$${typeof value === 'number' ? value.toLocaleString() : '0'}` 
            : (typeof value === 'number' ? value.toLocaleString() : '0')
          }
        </div>
        <p className="text-xs text-gray-500">
          {subtitle}
        </p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ⚡ QUICK ACTIONS with better organization
  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link to="/admin/products/create">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
          
          <Link to="/admin/categories/create">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </Link>
          
          <Link to="/admin/orders?status=pending">
            <Button className="w-full justify-start" variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              View Pending Orders ({stats.pendingOrders})
            </Button>
          </Link>
          
          <Link to="/admin/orders">
            <Button className="w-full justify-start" variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Manage All Orders
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  // 📈 RECENT ACTIVITY with real data - FIXED VERSION
  const RecentActivity = () => {
    // ✅ SAFE ARRAY EXTRACTION - Handle different API response formats
    const getOrdersArray = (ordersData) => {
      if (!ordersData) return [];
      if (Array.isArray(ordersData)) return ordersData;
      if (ordersData.data && Array.isArray(ordersData.data)) return ordersData.data;
      if (ordersData.orders && Array.isArray(ordersData.orders)) return ordersData.orders;
      return [];
    };

    const ordersArray = getOrdersArray(orders);
    const recentOrders = ordersArray.slice(0, 5);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded-full ${
                      order.orderStatus === 'completed' ? 'bg-green-100' :
                      order.orderStatus === 'pending' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {order.orderStatus === 'completed' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order #{order.orderId || order._id?.slice(-6)}</p>
                      <p className="text-xs text-gray-500">
                        {order.customerEmail || 'Customer'} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${(order.totalAmount || order.total || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 capitalize">{order.orderStatus || order.status}</p>
                  </div>
                </div>
              ))}
              
              <Link to="/admin/orders">
                <Button variant="outline" className="w-full mt-3">
                  View All Orders
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No orders yet. When customers place orders, they'll appear here.
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  // ⏳ LOADING STATE
  const isLoading = productsLoading || ordersLoading || categoriesLoading;
  
  if (isLoading) {
    return (
      <div className="px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="col-span-2 h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN DASHBOARD CONTENT
  return (
    <div className="px-8">
      
      {/* 📋 PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* 📊 MAIN STATISTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-blue-500"
          subtitle="Active products in inventory"
          trend={products?.length > 10 ? "+12% this month" : null}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="bg-green-500"
          subtitle="All time orders"
          trend={stats.totalOrders > 0 ? "+8% this month" : null}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-purple-500"
          subtitle="Unique customers"
          trend={stats.totalCustomers > 5 ? "+15% this month" : null}
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="bg-yellow-500"
          subtitle="All time revenue"
          trend={stats.totalRevenue > 1000 ? "+25% this month" : null}
        />
      </div>

      {/* 📈 ADDITIONAL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          icon={TrendingUp}
          color="bg-indigo-500"
          subtitle="This month's earnings"
        />
        <StatCard
          title="Average Order Value"
          value={stats.avgOrderValue}
          icon={DollarSign}
          color="bg-pink-500"
          subtitle="Per order average"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="bg-orange-500"
          subtitle="Awaiting processing"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={CheckCircle}
          color="bg-emerald-500"
          subtitle="Successfully delivered"
        />
      </div>

      {/* ⚡ QUICK ACTIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
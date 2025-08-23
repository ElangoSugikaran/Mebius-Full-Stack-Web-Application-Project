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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

  // 📈 ENHANCED RECENT ACTIVITY with charts and better visualization
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
    const recentOrders = ordersArray.slice(0, 6); // Get 6 recent orders for better chart data
    
    // 📊 PREPARE CHART DATA - Order trend over last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: 0,
        revenue: 0
      };
    });

    // Count orders per day
    ordersArray.forEach(order => {
      const orderDate = new Date(order.createdAt || order.orderDate).toISOString().split('T')[0];
      const dayData = last7Days.find(day => day.date === orderDate);
      if (dayData) {
        dayData.orders++;
        dayData.revenue += (order.totalAmount || order.total || 0);
      }
    });

    // 🎨 Chart configuration
    const chartConfig = {
      orders: { label: "Orders", color: "hsl(220, 70%, 50%)" },
      revenue: { label: "Revenue", color: "hsl(160, 60%, 45%)" }
    };

    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recent Order Activity
            </span>
            <Badge variant="outline" className="text-xs">
              Last 7 days trend
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 📊 ORDER TREND MINI CHART */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Weekly Order Trend
            </h4>
            <div className="h-32">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart
                  data={last7Days}
                  margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                    interval={0}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-sm text-blue-600">
                              Orders: {payload[0]?.value || 0}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-orders)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-orders)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "var(--color-orders)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {/* 📋 RECENT ORDERS LIST with enhanced styling */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Latest Orders ({recentOrders.length})
                </h4>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {stats.pendingOrders} Pending
                  </Badge>
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    {stats.completedOrders} Complete
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {recentOrders.map((order, index) => {
                  const orderValue = order.totalAmount || order.total || 0;
                  const status = order.orderStatus || order.status || 'pending';
                  
                  return (
                    <div key={order._id || index} className="group relative">
                      <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-md transition-all duration-200">
                        
                        {/* 👤 ORDER INFO */}
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`p-2 rounded-full ${
                            status === 'completed' ? 'bg-green-100' :
                            status === 'pending' ? 'bg-yellow-100' :
                            status === 'processing' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : status === 'processing' ? (
                              <Clock className="h-4 w-4 text-blue-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                Order #{order.orderId || order._id?.slice(-6) || `ORD${index + 1}`}
                              </p>
                              <Badge 
                                variant={status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs capitalize"
                              >
                                {status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {order.customerEmail || order.customerName || 'Customer'} • {' '}
                              {new Date(order.createdAt || order.orderDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* 💰 ORDER VALUE & PROGRESS */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${orderValue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.products?.length || 1} item{(order.products?.length || 1) !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          {/* 📊 MINI PROGRESS INDICATOR */}
                          <div className="w-16">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  status === 'completed' ? 'bg-green-500 w-full' :
                                  status === 'processing' ? 'bg-blue-500 w-2/3' :
                                  status === 'pending' ? 'bg-yellow-500 w-1/3' :
                                  'bg-gray-400 w-1/4'
                                }`}
                              />
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-1 capitalize">
                              {status}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* 🌈 SUBTLE GRADIENT BORDER based on order value */}
                      <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        orderValue > 1000 ? 'bg-gradient-to-r from-green-100 to-blue-100' :
                        orderValue > 500 ? 'bg-gradient-to-r from-blue-100 to-purple-100' :
                        'bg-gradient-to-r from-gray-100 to-slate-100'
                      }`} style={{ zIndex: -1 }} />
                    </div>
                  );
                })}
              </div>
              
              {/* 🔗 VIEW ALL BUTTON */}
              <div className="pt-3 border-t border-gray-100">
                <Link to="/admin/orders">
                  <Button variant="outline" className="w-full group hover:bg-blue-50">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Orders
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full group-hover:bg-blue-200">
                      {stats.totalOrders}
                    </span>
                  </Button>
                </Link>
              </div>
              
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">
                No orders yet. When customers place orders, they'll appear here.
              </p>
              <Link to="/admin/products" className="inline-block mt-3">
                <Button size="sm" variant="outline">
                  Add Products to Get Started
                </Button>
              </Link>
            </div>
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
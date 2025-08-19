import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { 
  useGetAllProductsQuery,
  useGetAllOrdersQuery 
} from "@/lib/api";
import { 
  DollarSign,
  ShoppingCart, 
  TrendingUp,
  Package,
  Calendar,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const SalesDashboard = () => {
  // 📊 FETCH DATA
  const { data: products, isLoading: productsLoading } = useGetAllProductsQuery();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrdersQuery();
  
  // 📅 DATE FILTER STATE
  const [dateRange, setDateRange] = useState('7'); // '7' or '30' days
  
  // 💾 SALES METRICS STATE
  const [salesMetrics, setSalesMetrics] = useState({
    todaySales: { count: 0, revenue: 0 },
    monthSales: { count: 0, revenue: 0 },
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [],
    recentOrders: [],
    dailySalesData: []
  });

  // 🎨 Chart configuration for Shadcn/UI
  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-3))",
    },
  };

  // 🔢 HELPER: Safe array extraction
  const getOrdersArray = (ordersData) => {
    if (!ordersData) return [];
    if (Array.isArray(ordersData)) return ordersData;
    if (ordersData.data && Array.isArray(ordersData.data)) return ordersData.data;
    if (ordersData.orders && Array.isArray(ordersData.orders)) return ordersData.orders;
    return [];
  };

  // 📈 CALCULATE SALES METRICS
  const calculateSalesMetrics = useMemo(() => {
    if (!orders) return null;
    
    const ordersArray = getOrdersArray(orders);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysToShow = parseInt(dateRange);
    const startDate = new Date(today.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000);
    
    // Initialize metrics
    let todaySales = { count: 0, revenue: 0 };
    let monthSales = { count: 0, revenue: 0 };
    let totalRevenue = 0;
    const productSales = new Map();
    const dailySales = new Map();
    
    // Initialize daily sales for chart
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailySales.set(dateStr, { 
        date: dateStr, 
        sales: 0, 
        orders: 0,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    // Process orders
    ordersArray.forEach(order => {
      const orderDate = new Date(order.createdAt || order.orderDate);
      const orderTotal = order.totalAmount || order.total || 0;
      
      // Only process completed orders for sales metrics
      if (order.orderStatus === 'completed' || order.status === 'completed') {
        totalRevenue += orderTotal;
        
        // Today's sales
        if (orderDate >= startOfToday) {
          todaySales.count++;
          todaySales.revenue += orderTotal;
        }
        
        // Month's sales
        if (orderDate >= startOfMonth) {
          monthSales.count++;
          monthSales.revenue += orderTotal;
        }
        
        // Daily sales for chart
        const orderDateStr = orderDate.toISOString().split('T')[0];
        if (dailySales.has(orderDateStr)) {
          const dayData = dailySales.get(orderDateStr);
          dayData.sales += orderTotal;
          dayData.orders++;
        }
        
        // Product sales tracking
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(item => {
            const productId = item.productId || item.product;
            const quantity = item.quantity || 1;
            
            if (productSales.has(productId)) {
              productSales.set(productId, productSales.get(productId) + quantity);
            } else {
              productSales.set(productId, quantity);
            }
          });
        }
      }
    });
    
    // Get top selling products
    const topProductsArray = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const product = products?.find(p => p._id === productId);
        return {
          id: productId,
          name: product?.name || 'Unknown Product',
          quantity,
          revenue: quantity * (product?.price || 0)
        };
      });
    
    // 🔧 FIXED: Create a copy of the array before sorting
    const recentOrdersArray = [...ordersArray]
      .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
      .slice(0, 5);
    
    // Convert daily sales to array for chart
    const dailySalesArray = Array.from(dailySales.values());
    
    return {
      todaySales,
      monthSales,
      totalOrders: ordersArray.length,
      avgOrderValue: ordersArray.length > 0 ? totalRevenue / ordersArray.length : 0,
      topProducts: topProductsArray,
      recentOrders: recentOrdersArray,
      dailySalesData: dailySalesArray
    };
  }, [orders, products, dateRange]);

  // Update state when calculations change
  useEffect(() => {
    if (calculateSalesMetrics) {
      setSalesMetrics(calculateSalesMetrics);
    }
  }, [calculateSalesMetrics]);

  // 📊 SALES METRICS CARDS
  const SalesCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
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
          {typeof value === 'number' && title.includes('Revenue') 
            ? `$${value.toLocaleString()}` 
            : value.toLocaleString()
          }
        </div>
        <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
        {trend && (
          <div className="flex items-center">
            {trend > 0 ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend)}% vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 📈 SALES TREND CHART - Updated with Shadcn/UI Chart
  const SalesTrendChart = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sales Trend - Last {dateRange} Days
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={dateRange === '7' ? 'default' : 'outline'}
              onClick={() => setDateRange('7')}
            >
              7 Days
            </Button>
            <Button 
              size="sm" 
              variant={dateRange === '30' ? 'default' : 'outline'}
              onClick={() => setDateRange('30')}
            >
              30 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <AreaChart
            data={salesMetrics.dailySalesData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              formatter={(value, name) => [
                `$${value.toLocaleString()}`,
                name === "sales" ? "Revenue" : "Orders"
              ]}
            />
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sales)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sales)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="sales"
              type="natural"
              fill="url(#fillSales)"
              fillOpacity={0.4}
              stroke="var(--color-sales)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  // 🏆 TOP SELLING PRODUCTS - Updated with Bar Chart
  const TopProducts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {salesMetrics.topProducts.length > 0 ? (
          <div className="space-y-6">
            {/* 📊 Product Performance Chart */}
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <BarChart
                data={salesMetrics.topProducts}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === "quantity" ? `${value} sold` : `$${value.toLocaleString()}`,
                    name === "quantity" ? "Quantity" : "Revenue"
                  ]}
                />
                <Bar
                  dataKey="quantity"
                  fill="var(--color-sales)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>

            {/* 📋 Product List */}
            <div className="space-y-3">
              {salesMetrics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-32">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/admin/products">
              <Button variant="outline" className="w-full mt-3">
                <Eye className="h-4 w-4 mr-2" />
                View All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No sales data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 📋 RECENT ORDERS TABLE
  const RecentOrdersTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
          <Link to="/admin/orders">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {ordersLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : salesMetrics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Payment</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {salesMetrics.recentOrders.map((order, index) => (
                  <tr key={order._id || index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <span className="text-sm font-mono">
                        #{order.orderId || order._id?.slice(-6) || `ORD${index + 1}`}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm">
                        {order.customerEmail || order.customerName || 'Customer'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm font-medium">
                        ${(order.totalAmount || order.total || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm capitalize">
                        {order.paymentMethod || 'Card'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <Badge 
                        variant={
                          order.orderStatus === 'completed' ? 'default' :
                          order.orderStatus === 'pending' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs"
                      >
                        {order.orderStatus || order.status || 'pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No orders found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 🔄 UPDATE METRICS WHEN DATA CHANGES
  useEffect(() => {
    if (!orders) return;
    
    const ordersArray = getOrdersArray(orders);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysToShow = parseInt(dateRange);
    const startDate = new Date(today.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000);
    
    // Calculate metrics
    let todaySales = { count: 0, revenue: 0 };
    let monthSales = { count: 0, revenue: 0 };
    let totalRevenue = 0;
    const productSales = new Map();
    const dailySales = new Map();
    
    // Initialize daily sales
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailySales.set(dateStr, { 
        date: dateStr, 
        sales: 0, 
        orders: 0,
        displayDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    // Process each order
    ordersArray.forEach(order => {
      const orderDate = new Date(order.createdAt || order.orderDate);
      const orderTotal = order.totalAmount || order.total || 0;
      
      // Only count completed orders for revenue
      if (order.orderStatus === 'completed' || order.status === 'completed') {
        totalRevenue += orderTotal;
        
        // Today's sales
        if (orderDate >= startOfToday) {
          todaySales.count++;
          todaySales.revenue += orderTotal;
        }
        
        // This month's sales
        if (orderDate >= startOfMonth) {
          monthSales.count++;
          monthSales.revenue += orderTotal;
        }
        
        // Daily sales for chart
        const orderDateStr = orderDate.toISOString().split('T')[0];
        if (dailySales.has(orderDateStr)) {
          const dayData = dailySales.get(orderDateStr);
          dayData.sales += orderTotal;
          dayData.orders++;
        }
        
        // Track product sales
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(item => {
            const productId = item.productId || item.product || item._id;
            const quantity = item.quantity || 1;
            
            if (productSales.has(productId)) {
              productSales.set(productId, productSales.get(productId) + quantity);
            } else {
              productSales.set(productId, quantity);
            }
          });
        }
      }
    });
    
    // Top products
    const topProductsArray = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const product = products?.find(p => p._id === productId);
        return {
          id: productId,
          name: product?.name || 'Unknown Product',
          quantity,
          revenue: quantity * (product?.price || 0)
        };
      });
    
    // 🔧 FIXED: Create a copy of the array before sorting (in useEffect too)
    const recentOrdersArray = [...ordersArray]
      .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
      .slice(0, 5);
    
    // Daily sales array
    const dailySalesArray = Array.from(dailySales.values());
    
    setSalesMetrics({
      todaySales,
      monthSales,
      totalOrders: ordersArray.length,
      avgOrderValue: ordersArray.length > 0 ? totalRevenue / ordersArray.length : 0,
      topProducts: topProductsArray,
      recentOrders: recentOrdersArray,
      dailySalesData: dailySalesArray
    });
    
  }, [orders, products, dateRange]);

  // ⏳ LOADING STATE
  if (productsLoading || ordersLoading) {
    return (
      <div className="px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN DASHBOARD RENDER
  return (
    <div className="px-8">
      
      {/* 📋 PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track your store's performance and sales analytics
        </p>
      </div>

      {/* 📊 KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SalesCard
          title="Today's Sales"
          value={salesMetrics.todaySales.revenue}
          subtitle={`${salesMetrics.todaySales.count} orders today`}
          icon={DollarSign}
          color="bg-green-500"
          trend={15}
        />
        <SalesCard
          title="Monthly Sales"
          value={salesMetrics.monthSales.revenue}
          subtitle={`${salesMetrics.monthSales.count} orders this month`}
          icon={Calendar}
          color="bg-blue-500"
          trend={8}
        />
        <SalesCard
          title="Total Orders"
          value={salesMetrics.totalOrders}
          subtitle="All time orders"
          icon={ShoppingCart}
          color="bg-purple-500"
          trend={12}
        />
        <SalesCard
          title="Avg Order Value"
          value={salesMetrics.avgOrderValue}
          subtitle="Per order average"
          icon={TrendingUp}
          color="bg-orange-500"
          trend={-3}
        />
      </div>

      {/* 📈 SALES TREND CHART */}
      <div className="mb-8">
        <SalesTrendChart />
      </div>

      {/* 🏆 TOP PRODUCTS & RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts />
        <RecentOrdersTable />
      </div>
    </div>
  );
};

export default SalesDashboard;
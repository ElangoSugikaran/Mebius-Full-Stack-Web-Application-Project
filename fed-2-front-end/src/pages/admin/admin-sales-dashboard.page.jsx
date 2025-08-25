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
  const { data: products, isLoading: productsLoading, error: productsError } = useGetAllProductsQuery();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetAllOrdersQuery();
  
  // 📅 DATE FILTER STATE
  const [dateRange, setDateRange] = useState('7'); // '7' or '30' days

  // 🎨 Chart configuration for Shadcn/UI
  const chartConfig = {
    sales: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--secondary))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  };

  // 🔢 HELPER: Safe array extraction with proper error handling
  const getOrdersArray = (ordersData) => {
    if (!ordersData) return [];
    
    // Handle different response structures
    if (Array.isArray(ordersData)) return ordersData;
    if (ordersData.orders && Array.isArray(ordersData.orders)) return ordersData.orders;
    if (ordersData.data && Array.isArray(ordersData.data)) return ordersData.data;
    
    console.warn('Unexpected orders data structure:', ordersData);
    return [];
  };

  // 🔢 HELPER: Safe products array extraction
  const getProductsArray = (productsData) => {
    if (!productsData) return [];
    
    if (Array.isArray(productsData)) return productsData;
    if (productsData.data && Array.isArray(productsData.data)) return productsData.data;
    
    console.warn('Unexpected products data structure:', productsData);
    return [];
  };

  // 📈 CALCULATE SALES METRICS - Fixed logic and error handling
  const salesMetrics = useMemo(() => {
    const ordersArray = getOrdersArray(orders);
    const productsArray = getProductsArray(products);
    
    if (ordersArray.length === 0) {
      console.log('No orders found for calculations');
      return {
        todaySales: { count: 0, revenue: 0 },
        monthSales: { count: 0, revenue: 0 },
        totalOrders: 0,
        avgOrderValue: 0,
        topProducts: [],
        recentOrders: [],
        dailySalesData: []
      };
    }
    
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysToShow = parseInt(dateRange);
    const startDate = new Date(today.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000);
    
    // Initialize metrics
    let todaySales = { count: 0, revenue: 0 };
    let monthSales = { count: 0, revenue: 0 };
    let totalRevenue = 0;
    let completedOrdersCount = 0;
    const productSales = new Map();
    const dailySales = new Map();
    
    // Initialize daily sales for chart with proper date formatting
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
    
    // Process orders with proper error handling
    ordersArray.forEach((order, index) => {
      try {
        // Handle different date field names and ensure valid date
        const orderDateStr = order.createdAt || order.orderDate || order.created_at;
        if (!orderDateStr) {
          console.warn(`Order ${index} missing date field:`, order);
          return;
        }
        
        const orderDate = new Date(orderDateStr);
        if (isNaN(orderDate.getTime())) {
          console.warn(`Invalid date for order ${index}:`, orderDateStr);
          return;
        }
        
        // Handle different total amount field names
        const orderTotal = Number(order.totalAmount || order.total || order.amount || 0);
        if (isNaN(orderTotal) || orderTotal < 0) {
          console.warn(`Invalid total for order ${index}:`, order);
          return;
        }
        
        // Check order status - be flexible with status field names and values
        const status = (order.orderStatus || order.status || '').toLowerCase();
        const isCompleted = status === 'completed' || status === 'fulfilled' || 
                           status === 'confirmed' || status === 'delivered';
        
        // Only process completed orders for revenue metrics
        if (isCompleted) {
          totalRevenue += orderTotal;
          completedOrdersCount++;
          
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
          
          // Daily sales for chart (within date range)
          const orderDateStr = orderDate.toISOString().split('T')[0];
          if (dailySales.has(orderDateStr)) {
            const dayData = dailySales.get(orderDateStr);
            dayData.sales += orderTotal;
            dayData.orders++;
          }
          
          // Product sales tracking with proper error handling
          const orderProducts = order.products || order.items || order.orderItems || [];
          if (Array.isArray(orderProducts)) {
            orderProducts.forEach(item => {
              try {
                const productId = item.productId || item.product?._id || item.product || item._id || item.id;
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price || item.unitPrice || 0);
                
                if (productId && quantity > 0) {
                  if (productSales.has(productId)) {
                    const existing = productSales.get(productId);
                    productSales.set(productId, {
                      ...existing,
                      quantity: existing.quantity + quantity,
                      revenue: existing.revenue + (quantity * price)
                    });
                  } else {
                    productSales.set(productId, {
                      quantity,
                      revenue: quantity * price,
                      productId
                    });
                  }
                }
              } catch (itemError) {
                console.warn('Error processing order item:', itemError, item);
              }
            });
          }
        }
      } catch (orderError) {
        console.warn(`Error processing order ${index}:`, orderError, order);
      }
    });
    
    // Get top selling products with proper product data matching
    const topProductsArray = Array.from(productSales.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity) // Sort by quantity sold
      .slice(0, 5)
      .map(([productId, salesData]) => {
        // Find product details from products array with better matching
        const product = productsArray.find(p => {
          // Convert both to strings for comparison to handle different ID types
          const pId = (p._id || p.id || '').toString();
          const searchId = productId.toString();
          
          return pId === searchId;
        });
        
        // Debug logging to see what we're working with
        console.log('Product lookup:', {
          searchingFor: productId,
          found: product,
          productName: product?.name || product?.title || product?.productName
        });
        
        return {
          id: productId,
          // Better name extraction with more fallback options
          name: product?.name || 
                product?.title || 
                product?.productName || 
                product?.displayName ||
                `Product ${productId.toString().slice(-4)}`, // Show last 4 chars of ID as fallback
          quantity: salesData.quantity,
          revenue: salesData.revenue || (salesData.quantity * (product?.price || product?.cost || 0)),
          price: product?.price || product?.cost || 0
        };
  });
    
    // Get recent orders (all orders, not just completed)
    const recentOrdersArray = [...ordersArray]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.orderDate || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.orderDate || b.created_at || 0);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(order => ({
        ...order,
        // Normalize field names for consistent display
        id: order._id || order.id,
        customerName: order.customerName || order.customer?.name || order.userInfo?.fullName || 'N/A',
        customerEmail: order.customerEmail || order.customer?.email || order.userInfo?.email || 'N/A',
        totalAmount: order.totalAmount || order.total || order.amount || 0,
        orderStatus: order.orderStatus || order.status || 'pending'
      }));
    
    // Convert daily sales to array for chart
    const dailySalesArray = Array.from(dailySales.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure proper date ordering
    
    const result = {
      todaySales,
      monthSales,
      totalOrders: ordersArray.length,
      avgOrderValue: completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0,
      topProducts: topProductsArray,
      recentOrders: recentOrdersArray,
      dailySalesData: dailySalesArray
    };
    
    console.log('📊 Calculated sales metrics:', {
      totalOrders: result.totalOrders,
      completedOrders: completedOrdersCount,
      todayRevenue: result.todaySales.revenue,
      topProductsCount: result.topProducts.length,
      dailyDataPoints: result.dailySalesData.length
    });
    
    return result;
  }, [orders, products, dateRange]);

  // 📊 SALES METRICS CARDS - Enhanced with better formatting
  const SalesCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4" 
          style={{ borderLeftColor: color.replace('bg-', '').includes('green') ? '#10b981' : 
          color.replace('bg-', '').includes('blue') ? '#3b82f6' : 
          color.replace('bg-', '').includes('purple') ? '#8b5cf6' : '#f59e0b' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1 text-gray-900">
          {title.toLowerCase().includes('revenue') || title.toLowerCase().includes('value') 
            ? `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : Number(value).toLocaleString()
          }
        </div>
        <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
        {trend !== undefined && (
          <div className="flex items-center">
            {trend > 0 ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : trend < 0 ? (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            ) : null}
            <span className={`text-xs font-medium ${
              trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {trend !== 0 ? `${Math.abs(trend)}% vs last period` : 'No change'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 📈 SALES TREND CHART - Fixed with proper data handling
  const SalesTrendChart = () => (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-semibold">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
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
        {salesMetrics.dailySalesData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <AreaChart
              data={salesMetrics.dailySalesData}
              margin={{
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                angle={dateRange === '30' ? -45 : 0}
                textAnchor={dateRange === '30' ? "end" : "middle"}
                height={dateRange === '30' ? 60 : 40}
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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 mb-1">{label}</p>
                        <p className="text-sm text-blue-600">
                          Revenue: ${payload[0].value.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Orders: {payload[0].payload.orders}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="sales"
                type="monotone"
                fill="url(#fillSales)"
                fillOpacity={0.4}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No sales data available</p>
              <p className="text-sm">Data will appear here once you have completed orders</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 🏆 TOP SELLING PRODUCTS - Enhanced with better chart and error handling
  const TopProducts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <Package className="h-5 w-5 mr-2 text-primary" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {salesMetrics.topProducts.length > 0 ? (
          <div className="space-y-6">
            {/* 📊 Product Performance Chart - Fixed data structure */}
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <BarChart
                data={salesMetrics.topProducts}
                margin={{
                  left: 20,
                  right: 20,
                  top: 20,
                  bottom: 60,
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
                  width={100}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium text-gray-900 mb-1">{label}</p>
                          <p className="text-sm text-blue-600">
                            Quantity Sold: {data.quantity}
                          </p>
                          <p className="text-sm text-green-600">
                            Revenue: ${data.revenue.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="quantity"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>

            {/* 📋 Product List - Enhanced styling */}
            <div className="space-y-3">
              {salesMetrics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      <span className="text-sm font-bold text-white">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-40">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/admin/products">
              <Button variant="outline" className="w-full mt-4 hover:bg-primary hover:text-white transition-colors">
                <Eye className="h-4 w-4 mr-2" />
                View All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No product sales yet</p>
            <p className="text-sm">Sales data will appear here once orders are completed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 📋 RECENT ORDERS TABLE - Enhanced with better error handling
  const RecentOrdersTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-semibold">
            <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
            Recent Orders
          </CardTitle>
          <Link to="/admin/orders">
            <Button size="sm" variant="outline" className="hover:bg-primary hover:text-white transition-colors">
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
              <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
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
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {salesMetrics.recentOrders.map((order, index) => (
                  <tr key={order.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <span className="text-sm font-mono font-medium text-blue-600">
                        #{order.orderId || order.id?.toString().slice(-6) || `ORD${String(index + 1).padStart(3, '0')}`}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </span>
                        {order.customerEmail !== 'N/A' && (
                          <p className="text-xs text-gray-500">{order.customerEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm font-semibold text-gray-900">
                        ${Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm capitalize text-gray-700">
                        {order.paymentMethod || 'Card'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <Badge 
                        variant={
                          ['completed', 'fulfilled', 'delivered'].includes(order.orderStatus.toLowerCase()) ? 'default' :
                          ['pending', 'processing'].includes(order.orderStatus.toLowerCase()) ? 'secondary' :
                          ['cancelled', 'failed'].includes(order.orderStatus.toLowerCase()) ? 'destructive' :
                          'outline'
                        }
                        className="text-xs capitalize"
                      >
                        {order.orderStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No orders found</p>
            <p className="text-sm">Orders will appear here once customers place them</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ⚠️ ERROR HANDLING
  if (productsError || ordersError) {
    return (
      <div className="px-8">
        <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h3>
            <p className="text-red-600 mb-4">
              {productsError?.data?.message || ordersError?.data?.message || 'Unable to fetch dashboard data'}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  // 🎯 MAIN RENDER
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      {/* 📊 HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DollarSign className="h-8 w-8 mr-3 text-primary" />
              Sales Dashboard
            </h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-3">
            <Link to="/admin/orders">
              <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Orders
              </Button>
            </Link>
            <Link to="/admin/products">
              <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 📈 KEY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SalesCard
          title="Today's Revenue"
          value={salesMetrics.todaySales.revenue}
          subtitle={`${salesMetrics.todaySales.count} orders today`}
          icon={DollarSign}
          color="bg-green-500"
          trend={15} // You can calculate actual trend if needed
        />
        
        <SalesCard
          title="This Month"
          value={salesMetrics.monthSales.revenue}
          subtitle={`${salesMetrics.monthSales.count} orders this month`}
          icon={TrendingUp}
          color="bg-blue-500"
          trend={8}
        />
        
        <SalesCard
          title="Total Orders"
          value={salesMetrics.totalOrders}
          subtitle="All time orders"
          icon={ShoppingCart}
          color="bg-purple-500"
          trend={0}
        />
        
        <SalesCard
          title="Avg Order Value"
          value={salesMetrics.avgOrderValue}
          subtitle="Per completed order"
          icon={Package}
          color="bg-orange-500"
          trend={-3}
        />
      </div>

      {/* 📊 SALES TREND CHART */}
      <div className="mb-8">
        <SalesTrendChart />
      </div>

      {/* 📋 BOTTOM SECTION - Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopProducts />
        <RecentOrdersTable />
      </div>

      {/* 📊 ADDITIONAL INSIGHTS - Optional Enhancement */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {salesMetrics.topProducts.length}
            </div>
            <p className="text-blue-800 font-medium">Products Sold</p>
            <p className="text-sm text-blue-600 mt-1">This period</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {salesMetrics.dailySalesData.reduce((sum, day) => sum + day.orders, 0)}
            </div>
            <p className="text-green-800 font-medium">Orders Processed</p>
            <p className="text-sm text-green-600 mt-1">Last {dateRange} days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              ${Math.round(salesMetrics.dailySalesData.reduce((sum, day) => sum + day.sales, 0) / parseInt(dateRange)).toLocaleString()}
            </div>
            <p className="text-purple-800 font-medium">Daily Average</p>
            <p className="text-sm text-purple-600 mt-1">Revenue per day</p>
          </CardContent>
        </Card>
      </div>

      {/* 📱 Mobile-Friendly Footer Info */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p className="flex items-center justify-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          Dashboard updates in real-time • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default SalesDashboard;
import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  Mail, 
  Search,
  Filter,
  Download,
  Eye,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Activity
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from "recharts";
import { useGetAllOrdersQuery } from "@/lib/api";

const CustomerManagementPage = () => {
  // Only fetch orders data - this is the correct API call
  const { data: ordersData, isLoading, error } = useGetAllOrdersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debug logging
  useEffect(() => {
    console.log('CustomerManagement - Orders data:', ordersData);
    console.log('CustomerManagement - Loading:', isLoading);
    console.log('CustomerManagement - Error:', error);
  }, [ordersData, isLoading, error]);

  // Process orders to extract customer analytics
  const customerAnalytics = useMemo(() => {
    if (!ordersData?.orders) {
      console.log('No orders data available for customer analytics');
      return {
        customers: [],
        stats: {
          totalCustomers: 0,
          activeCustomers: 0,
          inactiveCustomers: 0,
          totalRevenue: 0
        },
        chartData: {
          registrations: [],
          activityData: [],
          revenueByMonth: []
        }
      };
    }

    const orders = ordersData.orders;
    console.log(`Processing ${orders.length} orders for customer analytics`);
    
    // Group orders by customer (using Clerk user ID)
    const customerMap = new Map();
    
    orders.forEach(order => {
      const customerId = order.userId;
      const userInfo = order.userInfo;
      
      if (!customerId || !userInfo) {
        console.log('Skipping order with missing user info:', order._id);
        return;
      }
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          fullName: userInfo.fullName || 'Unknown User',
          email: userInfo.email || 'No email',
          firstName: userInfo.firstName || userInfo.fullName?.split(' ')[0] || 'Unknown',
          lastName: userInfo.lastName || userInfo.fullName?.split(' ').slice(1).join(' ') || '',
          orders: [],
          totalSpent: 0,
          lastOrderDate: null,
          firstOrderDate: null,
          orderCount: 0,
          isActive: false
        });
      }
      
      const customer = customerMap.get(customerId);
      customer.orders.push(order);
      customer.totalSpent += order.totalAmount || 0;
      customer.orderCount += 1;
      
      const orderDate = new Date(order.createdAt);
      if (!customer.firstOrderDate || orderDate < customer.firstOrderDate) {
        customer.firstOrderDate = orderDate;
      }
      if (!customer.lastOrderDate || orderDate > customer.lastOrderDate) {
        customer.lastOrderDate = orderDate;
      }
      
      // Consider active if ordered in last 90 days
      const daysSinceLastOrder = (new Date() - customer.lastOrderDate) / (1000 * 60 * 60 * 24);
      customer.isActive = daysSinceLastOrder <= 90;
    });
    
    const customers = Array.from(customerMap.values());
    console.log(`Generated analytics for ${customers.length} customers`);
    
    // Calculate stats
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const inactiveCustomers = totalCustomers - activeCustomers;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    
    // Registration trend (based on first order date)
    const registrationsByMonth = customers.reduce((acc, customer) => {
      if (!customer.firstOrderDate) return acc;
      
      const date = customer.firstOrderDate;
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});
    
    const registrations = Object.entries(registrationsByMonth)
      .map(([month, count]) => ({ month, customers: count }))
      .sort((a, b) => new Date(a.month + " 1") - new Date(b.month + " 1"))
      .slice(-6);
    
    // Activity data for pie chart
    const activityData = [
      { name: 'Active', value: activeCustomers, color: '#10b981' },
      { name: 'Inactive', value: inactiveCustomers, color: '#ef4444' }
    ];
    
    // Revenue by month
    const revenueByMonth = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + (order.totalAmount || 0);
      return acc;
    }, {});
    
    const revenueData = Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => new Date(a.month + " 1") - new Date(b.month + " 1"))
      .slice(-6);
    
    return {
      customers: customers.sort((a, b) => (b.lastOrderDate || 0) - (a.lastOrderDate || 0)),
      stats: { totalCustomers, activeCustomers, inactiveCustomers, totalRevenue },
      chartData: { registrations, activityData, revenueByMonth: revenueData }
    };
  }, [ordersData]);

  // Filter customers based on search and status
  const filteredCustomers = useMemo(() => {
    let filtered = customerAnalytics.customers;
    
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(customer => 
        statusFilter === "active" ? customer.isActive : !customer.isActive
      );
    }
    
    return filtered;
  }, [customerAnalytics.customers, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer analytics...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    console.error('Customer management error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <UserX className="h-12 w-12 mx-auto mb-4" />
              <p>Failed to load customer data</p>
              <p className="text-sm text-gray-500 mt-2">
                Error: {error?.data?.message || error?.message || 'Please check your connection and try again'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600">Monitor customer activity and purchasing behavior</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.stats.totalCustomers}</div>
            <p className="text-xs text-gray-500">Unique purchasers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customerAnalytics.stats.activeCustomers}</div>
            <p className="text-xs text-gray-500">Purchased in last 90 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive Customers</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{customerAnalytics.stats.inactiveCustomers}</div>
            <p className="text-xs text-gray-500">No recent purchases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${customerAnalytics.stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">From all customers</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Activity Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Customer Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerAnalytics.chartData.activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {customerAnalytics.chartData.activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {customerAnalytics.chartData.activityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* New Customers Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerAnalytics.chartData.registrations}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerAnalytics.chartData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Directory ({filteredCustomers.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No customers found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Order</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">First Order</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {customer.firstName?.[0]}{customer.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{customer.fullName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={customer.isActive ? "default" : "secondary"}
                          className={customer.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-800"}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{customer.orderCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-green-600">
                          ${customer.totalSpent.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {customer.lastOrderDate ? (
                            <>
                              <div>{customer.lastOrderDate.toLocaleDateString()}</div>
                              <div className="text-gray-500">
                                {Math.floor((new Date() - customer.lastOrderDate) / (1000 * 60 * 60 * 24))} days ago
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {customer.firstOrderDate ? (
                            customer.firstOrderDate.toLocaleDateString()
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagementPage;
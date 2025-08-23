import React, { useMemo } from "react";
// import { useGetAllCustomersQuery } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Users, UserCheck, UserX, Calendar, Mail } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const CustomerManagementPage = () => {
  // const { data: customersData, isLoading, error } = useGetAllCustomersQuery();
  
  // Memoized calculations for charts
  const chartData = useMemo(() => {
    if (!customersData?.customers) return { registrations: [], activityData: [], stats: {} };
    
    const customers = customersData.customers;
    
    // Calculate basic stats
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const inactiveCustomers = totalCustomers - activeCustomers;
    
    // Group registrations by month
    const registrationsByMonth = customers.reduce((acc, customer) => {
      const date = new Date(customer.createdAt);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});
    
    const registrations = Object.entries(registrationsByMonth)
      .map(([month, count]) => ({ month, registrations: count }))
      .sort((a, b) => new Date(a.month + " 1") - new Date(b.month + " 1"))
      .slice(-6); // Last 6 months
    
    // Activity data for pie chart
    const activityData = [
      { name: 'Active', value: activeCustomers, color: '#10b981' },
      { name: 'Inactive', value: inactiveCustomers, color: '#ef4444' }
    ];
    
    return {
      registrations,
      activityData,
      stats: { totalCustomers, activeCustomers, inactiveCustomers }
    };
  }, [customersData]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <UserX className="h-12 w-12 mx-auto mb-4" />
              <p>Failed to load customers</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const customers = customersData?.customers || [];
  
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-gray-600">View customer insights and registrations</p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{chartData.stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{chartData.stats.inactiveCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Not currently active
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registration Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.registrations}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="registrations" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Customer Activity Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Customer Activity Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {chartData.activityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No customers found</p>
              </div>
            ) : (
              customers.map((customer, index) => (
                <div key={customer._id}>
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {customer.firstName?.[0]}{customer.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            {customer.firstName} {customer.lastName}
                          </h3>
                          <Badge 
                            variant={customer.isActive ? "default" : "secondary"}
                            className={customer.isActive ? "bg-green-100 text-green-800" : ""}
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {customer.lastLoginAt && (
                          <p className="text-xs text-gray-500">
                            Last login: {new Date(customer.lastLoginAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Customer ID</p>
                      <p className="text-xs font-mono text-gray-400">
                        {customer._id}
                      </p>
                    </div>
                  </div>
                  
                  {index < customers.length - 1 && <Separator />}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagementPage;
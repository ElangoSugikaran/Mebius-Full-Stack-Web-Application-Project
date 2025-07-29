import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useGetAllProductsQuery } from "@/lib/api";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Plus,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 🎯 SIMPLE VERSION - What the dashboard shows
const AdminDashboardPage = () => {
  
  // 📊 GET DATA - Fetch products from your API
  const { data: products, isLoading, error } = useGetAllProductsQuery();
  
  // 💾 STORE STATS - Keep track of important numbers
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });

  // 🔄 UPDATE STATS - When products load, calculate numbers
  useEffect(() => {
    if (products) {
      setStats({
        totalProducts: products.length,
        totalOrders: 156,    // 🚨 PLACEHOLDER - Replace with real data
        totalCustomers: 89,  // 🚨 PLACEHOLDER - Replace with real data  
        totalRevenue: 12450  // 🚨 PLACEHOLDER - Replace with real data
      });
    }
  }, [products]);

  // 🃏 STAT CARD - Reusable component for showing numbers
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {/* 💰 Format money with $ sign */}
          {title.includes('Revenue') ? `$${value.toLocaleString()}` : value.toLocaleString()}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {title === 'Total Products' && 'Active products in inventory'}
          {title === 'Total Orders' && 'Orders this month'}
          {title === 'Total Customers' && 'Registered customers'}
          {title === 'Total Revenue' && 'Revenue this month'}
        </p>
      </CardContent>
    </Card>
  );

  // ⚡ QUICK ACTIONS - Buttons for common tasks
  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* 🆕 Add Product Button */}
          <Link to="/admin/products/create">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
          
          {/* 📦 View Orders Button */}
          <Link to="/admin/orders">
            <Button className="w-full justify-start" variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </Link>
          
          {/* 👥 Manage Customers Button */}
          <Link to="/admin/customers">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Customers
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  // ⏳ LOADING STATE - Show while data is loading
  if (isLoading) {
    return (
      <div className="px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ❌ ERROR STATE - Show if something goes wrong
  if (error) {
    return (
      <div className="px-8 text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-gray-500">Please try again later.</p>
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

      {/* 📊 STATISTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="bg-green-500"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="bg-yellow-500"
        />
      </div>

      {/* ⚡ QUICK ACTIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        
        {/* 📈 PLACEHOLDER for charts/recent activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Recent orders and activity will appear here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

/*
🎯 WHAT THIS PAGE DOES:

1. SHOWS STATISTICS:
   - How many products you have
   - How many orders you received
   - How many customers you have
   - How much money you made

2. PROVIDES QUICK ACTIONS:
   - Button to add new product
   - Button to view orders
   - Button to manage customers

3. HANDLES DIFFERENT STATES:
   - Loading: Shows skeleton while fetching data
   - Error: Shows error message if something fails
   - Success: Shows actual dashboard content

🔄 HOW IT WORKS:
1. Page loads → Fetch products from API
2. Calculate statistics from product data
3. Display numbers in pretty cards
4. Show quick action buttons
5. Update automatically when data changes

💡 WHY WE NEED THIS:
- Gives admins quick overview of business
- Shows important metrics at a glance
- Provides shortcuts to common tasks
- Looks professional and organized
*/
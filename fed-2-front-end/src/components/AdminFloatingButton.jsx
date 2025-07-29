// AdminFloatingButton.jsx - Floating button for quick admin access

import { Link } from "react-router";
import { Settings } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const AdminFloatingButton = () => {
  const { user } = useUser();
  
  // 🔍 Only show for admin users
  const isAdmin = user?.publicMetadata?.role === 'admin';
  
  // ❌ Don't show if not admin
  if (!isAdmin) return null;

  return (
    <Link 
      to="/admin"
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
      title="Go to Admin Panel"
    >
      <Settings className="h-6 w-6" />
    </Link>
  );
};

export default AdminFloatingButton;

/*
🎯 WHAT THIS DOES:
- Shows a floating button in bottom-right corner
- Only visible to admin users
- Provides quick access to admin panel from any client page
- Has nice hover effects and tooltip

🎨 STYLING:
- Fixed position (stays in place when scrolling)
- High z-index (appears above other content)
- Blue color to match admin theme
- Smooth hover animations
*/
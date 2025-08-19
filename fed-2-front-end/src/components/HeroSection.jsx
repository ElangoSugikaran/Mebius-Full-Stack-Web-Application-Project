import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

// 🎯 HERO SECTION COMPONENT
function HeroSection() {
  return (
    <section className="relative px-4 lg:px-16 pt-8 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* 📝 LEFT SIDE - Text Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* 🏷️ Small badge to grab attention */}
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              New Collection 2025
            </Badge>
            
            {/* 📢 Main headline - Most important text on page */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              Style That
              <span className="text-blue-600"> Speaks</span>
              <br />
              Your Language
            </h1>
            
            {/* 📄 Supporting text - Explain what you offer */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-lg">
              Discover premium fashion that fits your lifestyle. From casual comfort to elegant sophistication, find your perfect style with our curated collections.
            </p>
          </div>
          
          {/* 🔘 Call-to-action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop">
              <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                View Collections
              </Button>
            </Link>
          </div>
        </div>
        
        {/* 🖼️ RIGHT SIDE - Hero Images Grid */}
        <div className="grid grid-cols-2 gap-4 h-[500px] lg:h-[600px]">
          {/* 🔵 Large featured image */}
          <div className="col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
            <img
              src="/assets/images/729091cd0452fb9d0b89106ceec16368.png"
              alt="Featured fashion collection"
              className="w-full h-2/3 object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900">Summer Collection</h3>
                <p className="text-sm text-gray-600">100+ New Arrivals</p>
              </div>
            </div>
          </div>
          
          {/* 🟠 Two smaller images */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
            <img
              src="/assets/images/29a85f64d93c41afa6b64d31b3a88038.png"
              alt="Outdoor active wear"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-3 left-3">
              <span className="text-white font-medium text-sm">Outdoor Active</span>
            </div>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-teal-100">
            <img
              src="/assets/images/0233936f837e7b69d6a545511b1ba132.png"
              alt="Casual comfort wear"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-3 left-3">
              <span className="text-white font-medium text-sm">Casual Comfort</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default HeroSection;
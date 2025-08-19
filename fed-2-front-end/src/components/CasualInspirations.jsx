import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// 💡 CASUAL INSPIRATIONS COMPONENT - Enhanced
function CasualInspirations() {
  return (
    <section className="px-4 lg:px-16 py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* 📝 Left Side - Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Casual Inspirations
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our favorite combinations for casual outfits that can inspire you to create amazing looks for your daily activities. From comfortable loungewear to stylish street fashion.
            </p>
          </div>
          
          {/* 📊 Features List */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-700">100+ Style combinations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-700">Seasonal outfit guides</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-700">Mix & match suggestions</span>
            </div>
          </div>
          
          {/* 🔘 CTA Button */}
          <Link to="/shop">
            <Button size="lg" className="px-8">
              Browse Inspirations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        {/* 🖼️ Right Side - Images */}
        <div className="grid grid-cols-2 gap-4 h-[500px]">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="/assets/images/ca0df25c3d226a223269e70541e09760.png"
              alt="Casual inspirations outfit"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <span className="text-white font-medium">Everyday Casual</span>
            </div>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="/assets/images/2a24c60e5479cec788203caf906828d8.png"
              alt="Casual inspirations outfit"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <span className="text-white font-medium">Weekend Vibes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default CasualInspirations;
import CasualInspirations from "@/components/CasualInspirations";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import CategoriesShowcase from "@/components/CategoriesShowcase";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* 🎯 HERO SECTION - First impression matters! */}
      <HeroSection />
      
      {/* 🏷️ CATEGORIES SHOWCASE - Help users find what they want */}
      <CategoriesShowcase />
      
      {/* 🔥 TRENDING PRODUCTS - Show popular items */}
      <TrendingSection />
      
      {/* 💡 CASUAL INSPIRATIONS - Lifestyle content */}
      <CasualInspirations />
      
    </div>
  );
};

export default HomePage;
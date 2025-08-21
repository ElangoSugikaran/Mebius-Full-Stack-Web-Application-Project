import { Link } from "react-router";
import { useGetAllCategoriesQuery } from "../lib/api";

// 🏷️ CATEGORIES SHOWCASE COMPONENT
function CategoriesShowcase() {
  const { data: categories = [] } = useGetAllCategoriesQuery();
  
  return (
    <section className="px-4 lg:px-16 py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Shop by Category
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our diverse collection of premium fashion items, carefully curated for every occasion and style preference.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {categories.slice(0, 5).map((category) => (
          <Link
            key={category._id}
            to={`/shop/${category.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
            className="group"
          >
            <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to a placeholder if image fails to load
                      e.target.src = `https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=${category.name.charAt(0)}`;
                    }}
                  />
                ) : (
                  // Fallback placeholder when no image is provided
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                    {category.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {category.description || `Discover ${category.name.toLowerCase()}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoriesShowcase;
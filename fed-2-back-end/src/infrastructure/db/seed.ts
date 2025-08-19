import "dotenv/config";
import connectDB from './index';
import Category from "./entities/Category";
import Product from "./entities/Product";
import stripe from "../stripe";

const CATEGORY_NAMES = ["Socks", "Pants", "T-shirts", "Shoes", "Shorts"];
const ADJECTIVES = ["Classic", "Sporty", "Elegant", "Comfy", "Trendy"];
const NOUNS = ["Runner", "Style", "Fit", "Wear", "Edition"];

// Color and size options for realistic products
const COLORS = ["Black", "White", "Gray", "Blue", "Red", "Green", "Brown"];
const SIZES = {
  "Socks": ["S", "M", "L"],
  "Pants": ["XS", "S", "M", "L", "XL", "XXL"],
  "T-shirts": ["XS", "S", "M", "L", "XL", "XXL"],
  "Shoes": ["6", "7", "8", "9", "10", "11", "12"],
  "Shorts": ["XS", "S", "M", "L", "XL", "XXL"]
};

const GENDERS = ["men", "women", "unisex"];
const BRANDS = ["Nike", "Adidas", "Puma", "Under Armour", "Levi's", "Gap", "H&M"];
const MATERIALS = ["Cotton", "Polyester", "Wool", "Leather", "Denim", "Silk"];

function getRandomName(categoryName: string): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${categoryName} ${noun}`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number = 2): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Fix 1: Add proper TypeScript types for parameters
// Fix 2: Declare the products array inside the function
// Fix 3: Complete the Stripe product creation
const createProductsForCategory = async (categoryId: any, categoryName: string): Promise<void> => {
  const products: any[] = []; // Fix 2: Declare products array
  
  for (let i = 0; i < 10; i++) {
    const name = getRandomName(categoryName);
    const price = Math.floor(Math.random() * 100) + 10; // Random price $10-$110
    const discount = Math.random() < 0.3 ? Math.floor(Math.random() * 30) : 0; // 30% chance of discount
    
    // Fix 3: Complete the Stripe product creation
    const stripeProduct = await stripe.products.create({
      name: name,
      description: `This is a ${categoryName} that is ${name}`,
      default_price_data: {
        currency: "usd",
        unit_amount: price * 100, // Stripe uses cents
      },
    });
    
    // Get appropriate sizes for this category
    const availableSizes = SIZES[categoryName as keyof typeof SIZES] || ["One Size"];
    const productSizes = getRandomElements(availableSizes, Math.floor(Math.random() * 3) + 1);
    const productColors = getRandomElements(COLORS, Math.floor(Math.random() * 3) + 1);
    
    // Add to our database
    products.push({
      categoryId,
      name,
      price,
      description: `This is a ${categoryName} that is ${name}`,
      image: `https://via.placeholder.com/300x300?text=${encodeURIComponent(name)}`,
      stock: Math.floor(Math.random() * 50) + 1, // Random stock 1-50
      stripePriceId: stripeProduct.default_price,
      sizes: productSizes,
      colors: productColors,
      material: getRandomElement(MATERIALS),
      brand: getRandomElement(BRANDS),
      gender: getRandomElement(GENDERS),
      discount: discount,
      finalPrice: price * (1 - discount / 100), // Calculate final price
      isFeatured: Math.random() < 0.2, // 20% chance to be featured
      isActive: true,
      salesCount: Math.floor(Math.random() * 100),
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3.0-5.0
      reviews: []
    });
  }
  
  await Product.insertMany(products); // Save all products at once
};

const seed = async (): Promise<void> => {
  try {
    await connectDB(); // Connect to database
    
    console.log("🗑️  Clearing existing data...");
    await Category.deleteMany({}); // Clear old categories
    await Product.deleteMany({}); // Clear old products
    
    console.log("🌱 Starting to seed database...");
    
    for (const name of CATEGORY_NAMES) {
      const category = await Category.create({ 
        name,
        isActive: true,
        image: `https://via.placeholder.com/200x200?text=${encodeURIComponent(name)}`
      });
      
      await createProductsForCategory(category._id, name);
      console.log(`✅ Seeded category: ${name} with 10 products`);
    }
    
    console.log("🎉 Seeding complete! Created 5 categories with 50 total products.");
    process.exit(0); // Stop the script
    
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
};

// Run the seed function and handle any errors
seed().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
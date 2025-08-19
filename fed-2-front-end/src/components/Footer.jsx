// components/Footer.jsx - Modern footer with all essential links
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  CreditCard,
  Shield,
  Truck
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* 🎯 MAIN FOOTER CONTENT */}
      <div className="px-4 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* 🏢 COMPANY INFO SECTION */}
          <div className="space-y-6">
            {/* 📛 Brand Logo */}
            <div>
              <Link to="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
                Mebius
              </Link>
              <p className="text-gray-300 mt-3 leading-relaxed">
                Your premier destination for fashion-forward clothing and accessories. 
                Style that speaks your language, quality that lasts.
              </p>
            </div>
            
            {/* 📱 SOCIAL MEDIA LINKS */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Follow Us</h4>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          {/* 🛍️ SHOP LINKS SECTION */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Shop</h4>
            <nav className="space-y-3">
              <Link 
                to="/shop" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                All Products
              </Link>
              <Link 
                to="/shop/shoes" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Shoes
              </Link>
              <Link 
                to="/shop/tshirts" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                T-Shirts
              </Link>
              <Link 
                to="/shop/shorts" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Shorts
              </Link>
              <Link 
                to="/shop/pants" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Pants
              </Link>
              <Link 
                to="/shop/socks" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Socks
              </Link>
              <Link 
                to="/shop/sale" 
                className="block text-red-400 hover:text-red-300 hover:translate-x-1 transition-all duration-200 font-medium"
              >
                Sale Items
              </Link>
            </nav>
          </div>
          
          {/* ℹ️ CUSTOMER SERVICE SECTION */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Customer Service</h4>
            <nav className="space-y-3">
              <Link 
                to="/contact" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Contact Us
              </Link>
              <Link 
                to="/faq" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                FAQ
              </Link>
              <Link 
                to="/shipping" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Shipping Info
              </Link>
              <Link 
                to="/returns" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Returns & Exchanges
              </Link>
              <Link 
                to="/size-guide" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Size Guide
              </Link>
              <Link 
                to="/track-order" 
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Track Your Order
              </Link>
            </nav>
          </div>
          
          {/* 📞 CONTACT INFO SECTION */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Get in Touch</h4>
            <div className="space-y-4">
              
              {/* 📧 Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Email us</p>
                  <a 
                    href="mailto:support@mebius.com" 
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    support@mebius.com
                  </a>
                </div>
              </div>
              
              {/* 📱 Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Call us</p>
                  <a 
                    href="tel:+1234567890" 
                    className="text-white hover:text-green-400 transition-colors"
                  >
                    +1 (234) 567-8900
                  </a>
                </div>
              </div>
              
              {/* 📍 Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Visit us</p>
                  <address className="text-white not-italic">
                    123 Fashion Street<br />
                    Style City, SC 12345<br />
                    United States
                  </address>
                </div>
              </div>
            </div>
            
            {/* 📰 Newsletter Signup */}
            <div className="mt-8">
              <h5 className="font-medium mb-3 text-white">Newsletter</h5>
              <p className="text-gray-300 text-sm mb-4">
                Get style tips and exclusive offers
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                />
                <Button size="sm" className="px-4">
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 🛡️ TRUST BADGES SECTION */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            
            {/* 🚚 Free Shipping */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-medium text-white">Free Shipping</h5>
                <p className="text-gray-400 text-sm">On orders over $75</p>
              </div>
            </div>
            
            {/* 🛡️ Secure Payment */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-medium text-white">Secure Payment</h5>
                <p className="text-gray-400 text-sm">SSL encrypted checkout</p>
              </div>
            </div>
            
            {/* 💝 Easy Returns */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-medium text-white">Easy Returns</h5>
                <p className="text-gray-400 text-sm">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 📄 BOTTOM FOOTER BAR */}
      <div className="border-t border-gray-800">
        <div className="px-4 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* 📅 Copyright */}
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Mebius. All rights reserved.
            </div>
            
            {/* 🏛️ Legal Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
              <Link 
                to="/accessibility" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Accessibility
              </Link>
            </div>
            
            {/* 💳 Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm mr-2">We Accept:</span>
              <div className="flex gap-1">
                <div className="w-8 h-5 bg-gray-700 rounded flex items-center justify-center">
                  <CreditCard className="w-3 h-3 text-gray-300" />
                </div>
                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">V</span>
                </div>
                <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <div className="w-8 h-5 bg-blue-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="w-8 h-5 bg-yellow-500 rounded flex items-center justify-center">
                  <span className="text-black text-xs font-bold">P</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
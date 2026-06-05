"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Heart, Menu, X, Loader2, Package, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import CartDrawer from './CartDrawer';
import { useCartStore } from '@/store/useCartStore';
import axios from 'axios';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictiveResults, setPredictiveResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [bumpBag, setBumpBag] = useState(false);
  const [bumpWishlist, setBumpWishlist] = useState(false);
  const router = useRouter();

  const { setActiveOffers, activeOffers } = useCartStore();
  const [showOffersDesktop, setShowOffersDesktop] = useState(false);
  const [showOffersMobile, setShowOffersMobile] = useState(false);
  const dropdownTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterOffers = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setShowOffersDesktop(true);
  };

  const handleMouseLeaveOffers = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setShowOffersDesktop(false);
    }, 300); // 300ms delay before closing
  };

  useEffect(() => {
    // Fetch active offers globally to apply cart discounts
    const fetchOffers = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/offers`);
        setActiveOffers(data);
      } catch (e) {
        console.error('Failed to load active offers for cart', e);
      }
    };
    fetchOffers();
  }, [setActiveOffers]);

  // Typewriter effect state
  const searchPhrases = [
    "Search for products...",
    "Search for lipsticks...",
    "Search for foundations...",
    "Search for skincare...",
    "Search for haircare..."
  ];
  const [placeholderText, setPlaceholderText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingSpeed = isDeleting ? 30 : 80;
    const currentPhrase = searchPhrases[phraseIndex];

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex === currentPhrase.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % searchPhrases.length);
      } else {
        setPlaceholderText(currentPhrase.substring(0, charIndex + (isDeleting ? -1 : 1)));
        setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  // 1. Pull the cart data from our Zustand store
  const cart = useCartStore((state) => state.cart);
  const userInfo = useAuthStore((state) => state.userInfo);
  
  // 2. Next.js Hydration fix (prevents errors when loading from localStorage)
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    
    // Fetch categories for the header
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`);
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories for header", error);
      }
    };
    fetchCategories();
  }, []);

  // Prevent background scrolling when menu or cart is open
  useEffect(() => {
    if (isMobileMenuOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isCartOpen]);


  // 3. Calculate total items
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Trigger bounce animation when cart or wishlist changes
  useEffect(() => {
    if (cartItemCount > 0) {
      setBumpBag(true);
      const timer = setTimeout(() => setBumpBag(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  useEffect(() => {
    if (userInfo?.wishlist && userInfo.wishlist.length > 0) {
      setBumpWishlist(true);
      const timer = setTimeout(() => setBumpWishlist(false), 300);
      return () => clearTimeout(timer);
    }
  }, [userInfo?.wishlist?.length]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setPredictiveResults([]);
      setShowDropdown(false);
      return;
    }
    
    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?keyword=${searchTerm}`);
        setPredictiveResults(data.slice(0, 5));
        setShowDropdown(true);
      } catch (error) {
        console.error("Failed to fetch predictive search results", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${searchTerm}`);
    }
  };

  return (
    <>
      <header className="w-full bg-primary sticky top-0 z-50 shadow-md transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center lg:w-1/3 justify-start">
            <div className="lg:hidden cursor-pointer mr-4" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-accent" />
            </div>
            <Link href="/" className="text-3xl font-serif font-medium text-accent tracking-widest">
              LUMIÈRE<span className="text-accent/70">.</span>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex lg:w-1/3 justify-center relative">
            <form onSubmit={handleSearch} className="w-full max-w-md relative group">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => { if (predictiveResults.length > 0) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder={placeholderText || "Search..."} 
                className="w-full bg-white/10 border-2 border-transparent rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:bg-white/20 focus:border-accent/50 transition-all duration-300 text-sm text-accent placeholder-accent/50 shadow-sm"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-accent/50 hover:text-accent transition-colors">
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-accent" /> : <Search className="w-5 h-5" />}
              </button>
            </form>
            
            {/* Predictive Search Dropdown */}
            {showDropdown && predictiveResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {predictiveResults.map((product) => (
                  <Link 
                    key={product._id} 
                    href={`/product/${product.slug || product._id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 truncate">{product.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{product.brand}</p>
                    </div>
                    <div className="font-bold text-secondary text-sm">
                      ৳{product.discountPrice > 0 ? product.discountPrice : product.price}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Icons */}
          <div className="flex items-center justify-end lg:w-1/3 space-x-6 sm:space-x-8">
            {isClient && userInfo ? (
              <Link href="/dashboard" className="flex flex-col items-center justify-center cursor-pointer group">
                <User className="w-5 h-5 text-accent group-hover:scale-110 group-hover:text-white transition-all duration-300" strokeWidth={1.5} />
                <span className="hidden md:block text-[9px] uppercase font-bold text-accent/70 group-hover:text-accent mt-1.5 tracking-[0.15em] transition-colors whitespace-nowrap text-center">My Account</span>
              </Link>
            ) : (
              <Link href="/login" className="flex flex-col items-center justify-center cursor-pointer group">
                <User className="w-5 h-5 text-accent group-hover:scale-110 group-hover:text-white transition-all duration-300" strokeWidth={1.5} />
                <span className="hidden md:block text-[9px] uppercase font-bold text-accent/70 group-hover:text-accent mt-1.5 tracking-[0.15em] transition-colors whitespace-nowrap text-center">Login</span>
              </Link>
            )}
            <Link href="/wishlist" className="relative flex flex-col items-center justify-center cursor-pointer group">
                <Heart className="w-5 h-5 text-accent group-hover:scale-110 group-hover:text-white transition-all duration-300" strokeWidth={1.5} />
                <span className="hidden md:block text-[9px] uppercase font-bold text-accent/70 group-hover:text-accent mt-1.5 tracking-[0.15em] transition-colors whitespace-nowrap text-center">Wishlist</span>
                {isClient && userInfo?.wishlist && userInfo.wishlist.length > 0 && (
                  <span className={`absolute -top-1.5 -right-2 md:right-1 bg-accent text-primary text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm ${bumpWishlist ? 'animate-bounce scale-110' : 'animate-in zoom-in duration-300'}`}>
                    {userInfo.wishlist.length}
                  </span>
                )}
            </Link>
            
            {/* Dynamic Cart Icon */}
            <div 
              className="relative flex flex-col items-center justify-center cursor-pointer group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5 text-accent group-hover:scale-110 group-hover:text-white transition-all duration-300" strokeWidth={1.5} />
              <span className="hidden md:block text-[9px] uppercase font-bold text-accent/70 group-hover:text-accent mt-1.5 tracking-[0.15em] transition-colors whitespace-nowrap text-center">Bag</span>
              {/* Only show badge if isClient (hydration fix) and count > 0 */}
              {isClient && cartItemCount > 0 && (
                <span className={`absolute -top-1.5 -right-2 md:right-0 bg-accent text-primary text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm ${bumpBag ? 'animate-bounce scale-110' : 'animate-in zoom-in duration-300'}`}>
                  {cartItemCount}
                </span>
              )}
          </div>
        </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden px-4 pb-4">
          <div className="relative">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => { if (predictiveResults.length > 0) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder={placeholderText || "Search..."} 
                className="w-full bg-white/10 border-2 border-transparent rounded-full py-2 px-5 focus:outline-none focus:bg-white/20 focus:border-accent/50 transition-all duration-300 text-sm text-accent placeholder-accent/50 shadow-sm"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-accent/50 hover:text-accent transition-colors">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Search className="w-4 h-4" />}
              </button>
            </form>
            
            {/* Predictive Search Dropdown Mobile */}
            {showDropdown && predictiveResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {predictiveResults.map((product) => (
                  <Link 
                    key={product._id} 
                    href={`/product/${product.slug || product._id}`}
                    onClick={() => { setShowDropdown(false); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{product.name}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{product.brand}</p>
                    </div>
                    <div className="font-bold text-secondary text-xs">
                      ৳{product.discountPrice > 0 ? product.discountPrice : product.price}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block bg-primary border-t border-accent/20 shadow-sm">
          <nav className="container mx-auto px-4 py-4 flex justify-center space-x-12 xl:space-x-16 text-[11px] font-medium uppercase text-accent/80 tracking-[0.2em]">
            {categories.map((cat) => (
              <Link 
                key={cat.slug} 
                href={`/category/${cat.slug}`} 
                className="hover:text-white relative after:absolute after:-bottom-4 after:left-0 after:w-full after:h-[1px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            
            {activeOffers && activeOffers.length > 0 && (
              <div 
                className="relative group cursor-pointer"
                onMouseEnter={handleMouseEnterOffers}
                onMouseLeave={handleMouseLeaveOffers}
              >
                <div className="hover:text-white relative after:absolute after:-bottom-4 after:left-0 after:w-full after:h-[1px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center transition-colors flex items-center">
                  Offers
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${showOffersDesktop ? 'rotate-180' : ''}`} />
                </div>
                {showOffersDesktop && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {activeOffers.map((offer: any) => (
                      <Link 
                        key={offer._id} 
                        href={`/offer/${offer.slug}`}
                        className="block px-4 py-2 hover:bg-gray-50 hover:text-primary transition-colors truncate normal-case text-xs tracking-normal font-semibold text-gray-700"
                        onClick={() => setShowOffersDesktop(false)}
                      >
                        {offer.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <Link href="/brands" className="hover:text-primary relative after:absolute after:-bottom-4 after:left-0 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center transition-colors">Brands</Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-[#F5DFCA] z-[70] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/" className="text-2xl font-serif font-medium text-primary tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>
            LUMIÈRE<span className="text-gray-900">.</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-6">
          {/* Mobile Nav Links */}
          <nav className="flex flex-col space-y-6 text-[13px] font-medium uppercase text-gray-700 tracking-widest">
            {categories.map((cat) => (
              <Link 
                key={cat.slug}
                href={`/category/${cat.slug}`} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            
            {activeOffers && activeOffers.length > 0 && (
              <div className="flex flex-col">
                <div 
                  className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowOffersMobile(!showOffersMobile)}
                >
                  <span>Offers</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showOffersMobile ? 'rotate-180' : ''}`} />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showOffersMobile ? 'max-h-64 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col space-y-4 pl-4 border-l-2 border-gray-100">
                    {activeOffers.map((offer: any) => (
                      <Link 
                        key={offer._id}
                        href={`/offer/${offer.slug}`} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="hover:text-primary transition-colors text-xs font-semibold tracking-wider text-gray-500 normal-case"
                      >
                        {offer.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <Link href="/brands" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">Brands</Link>
          </nav>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
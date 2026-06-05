"use client";
import React, { useEffect, useState } from 'react';
import { cachedGet } from '@/utils/apiCache';
import ProductCard from "@/components/ProductCard";
import Link from 'next/link';
import { Sparkles, PackageSearch } from 'lucide-react';
import OfferCarousel from '@/components/OfferCarousel';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, offersRes] = await Promise.all([
          cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?sort=trending`),
          cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`),
          cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/offers`)
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setOffers(offersRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(prev => prev === categoryId ? null : categoryId);
  };

  const handleShopNowScroll = () => {
    const section = document.getElementById('category-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter products by selected category client-side
  let filteredProducts = selectedCategoryId
    ? products.filter((product: any) => product.category === selectedCategoryId)
    : products;

  filteredProducts = filteredProducts.slice(0, 6);

  const selectedCategory = categories.find(c => c._id === selectedCategoryId);
  const selectedCategoryName = selectedCategory?.name;
  const selectedCategorySlug = selectedCategory?.slug;

  return (
    <main className="min-h-screen bg-transparent pb-20">
      

      {loading ? (
        <div className="w-full aspect-[16/7] md:aspect-[21/9] lg:aspect-[4/1] bg-gray-200 animate-pulse flex items-center justify-center mb-16">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      ) : offers && offers.length > 0 ? (
        <OfferCarousel offers={offers} />
      ) : (
        <section className="w-full h-[calc(100vh-116px)] relative flex items-center justify-center text-center overflow-hidden bg-black">
          {/* Background Image with Blur */}
          <div className="absolute -inset-4 z-0">
            <img 
              src="/images/banner.png" 
              alt="The K-Beauty Glow Up Background" 
              className="w-full h-full object-cover animate-kenburns opacity-80"
            />
            {/* Subtle dark gradient overlay to make text pop */}
            <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 px-4 max-w-3xl flex flex-col items-center mt-[-40px]">
            <h1 className="text-4xl md:text-6xl md:leading-[1.1] font-serif font-semibold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] mb-6 uppercase tracking-[0.1em] animate-in slide-in-from-bottom-6 duration-700 delay-100 gold-gradient-text">
              The K-Beauty <br className="hidden md:block" /> <span className="text-white gold-gradient-text">Glow Up</span>
            </h1>
            <p className="text-sm md:text-lg text-white/90 font-light mb-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] max-w-xl tracking-wide animate-in slide-in-from-bottom-8 duration-700 delay-200">
              Explore the absolute best of Korean Skincare & Cosmetics.
            </p>
            <button 
              onClick={handleShopNowScroll}
              className="bg-primary hover:bg-white hover:text-black text-white px-12 py-4 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 shadow-xl hover:-translate-y-1 hover:shadow-primary/30 animate-in zoom-in duration-700 delay-300"
            >
              Shop Now
            </button>
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section id="category-section" className="container mx-auto px-4 mt-24 scroll-mt-32">
        <h2 className="text-2xl font-serif font-normal mb-12 text-center uppercase tracking-widest text-gray-900">Shop by Category</h2>
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {categories.map((item) => {
            const isActive = selectedCategoryId === item._id;
            return (
              <div 
                key={item._id} 
                onClick={() => handleCategoryClick(item._id)}
                className="flex flex-col items-center group cursor-pointer w-24 md:w-32"
              >
                <div className={`w-20 h-20 md:w-28 md:h-28 bg-[#F7F4D4] rounded-full border transition-all duration-300 p-1 mb-3 shadow-sm flex items-center justify-center overflow-hidden ${
                  isActive 
                    ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105' 
                    : 'border-gray-200 group-hover:border-primary group-hover:scale-105'
                }`}>
                  {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                     <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center text-primary/50 font-serif text-2xl uppercase">
                        {item.name.charAt(0)}
                     </div>
                  )}
                </div>
                <span className={`text-[11px] md:text-[12px] font-medium text-center uppercase tracking-widest transition-colors ${
                  isActive ? 'text-gray-900 font-bold' : 'text-gray-900/70 group-hover:text-gray-900'
                }`}>{item.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Grid */}
      <section id="trending-section" className="container mx-auto px-4 mt-28 scroll-mt-32">
        <div className="flex items-center justify-between mb-12 border-b border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-serif font-normal uppercase tracking-widest text-gray-900">
            {selectedCategoryName ? `${selectedCategoryName} Collection` : 'Trending Now'}
          </h2>
          <div className="flex items-center gap-4">
            {selectedCategoryId && (
              <button 
                onClick={() => setSelectedCategoryId(null)}
                className="text-xs font-bold text-gray-500 hover:text-primary uppercase tracking-wide"
              >
                Clear Filter
              </button>
            )}
            <Link href={selectedCategorySlug ? `/category/${selectedCategorySlug}` : "/category/all"} className="text-sm font-bold text-primary hover:underline uppercase">View All</Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-4">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <PackageSearch className="w-12 h-12 text-primary opacity-80" />
            </div>
            <h3 className="text-2xl font-serif text-gray-900 mb-2 uppercase tracking-wide">No Products Found</h3>
            <p className="text-gray-500 font-medium max-w-md">We couldn't find any products in this category at the moment. Try selecting a different category or check back later.</p>
            {selectedCategoryId && (
              <button onClick={() => setSelectedCategoryId(null)} className="mt-8 bg-primary text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all duration-300 shadow-lg hover:-translate-y-1">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
            {filteredProducts.map((product: any) => (
              <ProductCard 
                key={product._id}
                id={product._id}
                slug={product.slug}
                brand={product.brand}
                name={product.name}
                price={product.price}
                discountPrice={product.discountPrice}
                imageUrl={product.images ? product.images[0] : null}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { cachedGet } from '@/utils/apiCache';
import ProductCard from '@/components/ProductCard';
import { Loader2, ChevronRight, ShoppingBag, Search } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DUMMY_PRODUCTS = [
  { _id: 'd1', brand: 'FENTY BEAUTY', name: 'Pro Filt\'r Soft Matte Longwear Foundation', price: 4000, discountPrice: 3200, images: ['https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop'] },
  { _id: 'd2', brand: 'NARS', name: 'Radiant Creamy Concealer', price: 3200, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop'] },
  { _id: 'd3', brand: 'RARE BEAUTY', name: 'Soft Pinch Liquid Blush', price: 2500, discountPrice: 1999, images: ['https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=600&auto=format&fit=crop'] },
  { _id: 'd4', brand: 'CHARLOTTE TILBURY', name: 'Pillow Talk Matte Revolution Lipstick', price: 3800, images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop'] },
  { _id: 'd5', brand: 'MAC', name: 'Studio Fix Fluid SPF 15', price: 3500, discountPrice: 2900, images: ['https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=600&auto=format&fit=crop'] },
  { _id: 'd6', brand: 'ANASTASIA', name: 'Dipbrow Pomade', price: 2100, images: ['https://images.unsplash.com/photo-1625085448378-0cb93a02c3cc?q=80&w=600&auto=format&fit=crop'] },
  { _id: 'd7', brand: 'HUDA BEAUTY', name: 'The New Nude Eyeshadow Palette', price: 6500, discountPrice: 5000, images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600&auto=format&fit=crop'] },
  { _id: 'd8', brand: 'LANEIGE', name: 'Lip Sleeping Mask', price: 2400, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop'] },
];

function CategoryContent({ slug }: { slug: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any | null>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(0);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('newest');

  // Debounce the maxPrice and minPrice sliders to prevent fetch storms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
      setDebouncedMinPrice(minPrice);
    }, 500);
    return () => clearTimeout(timer);
  }, [maxPrice, minPrice]);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true);
      setError('');
      try {
        // 0. Handle "All Products" special case
        if (slug.toLowerCase() === 'all') {
          setCategory({ name: 'All Products', slug: 'all' });
          const categoriesRes = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`);
          setAllCategories(categoriesRes.data);
          let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?sort=${sortBy}`;
          if (debouncedMinPrice > 0) url += `&minPrice=${debouncedMinPrice}`;
          if (debouncedMaxPrice < 10000) url += `&maxPrice=${debouncedMaxPrice}`;
          
          const productsRes = await cachedGet(url);
          setProducts(productsRes.data);
          setLoading(false);
          return;
        }

        // 1. Fetch all categories to find the matching one by slug
        const categoriesRes = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`);
        setAllCategories(categoriesRes.data);
        const foundCategory = categoriesRes.data.find(
          (c: any) => c.slug?.toLowerCase() === slug.toLowerCase()
        );

        if (!foundCategory) {
          // If no precise category exists in DB yet, search products by keyword match as a smart fallback
          const productsRes = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?keyword=${slug}`);
          setProducts(productsRes.data);
          setCategory({ name: slug.charAt(0).toUpperCase() + slug.slice(1), slug });
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // 2. Fetch products and filter using backend API
        let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?category=${foundCategory._id}&sort=${sortBy}`;
        if (debouncedMinPrice > 0) url += `&minPrice=${debouncedMinPrice}`;
        if (debouncedMaxPrice < 10000) url += `&maxPrice=${debouncedMaxPrice}`;
        
        const productsRes = await cachedGet(url);
        setProducts(productsRes.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading category page:", err);
        setError('Failed to load category products. Please try again.');
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug, debouncedMaxPrice, debouncedMinPrice, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl max-w-md w-full text-center">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-black transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/30 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium mb-6 md:mb-8 uppercase tracking-wider">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">{category?.name}</span>
        </div>

        {/* Category Header */}
        <div className="rounded-3xl p-6 md:p-10 mb-8 md:mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-gradient-to-br from-pink-50/80 via-white to-pink-100/40 border border-white backdrop-blur-sm">
          {/* Abstract decorative elements */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          
          {category?.image && (
            <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full p-1.5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg relative z-10 ring-4 ring-white/50">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-full mix-blend-multiply" />
            </div>
          )}
          <div className="text-center md:text-left relative z-10">
            <h1 className="text-3xl md:text-4xl font-serif font-medium uppercase tracking-widest text-gray-900 mb-2 md:mb-3 drop-shadow-sm">
              {category?.name}
            </h1>
            <p className="text-xs md:text-sm text-gray-600 font-light tracking-wide max-w-xl leading-relaxed">
              {category?.description || `Discover our curated selection of high-performance ${category?.name?.toLowerCase() || ''} products tailored to reveal your natural glow.`}
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs">Filter by Price</h3>
              <div className="mb-8">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Min Price</label>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-200 focus-within:border-primary transition-colors">
                      <span className="text-xs text-gray-500 font-medium">৳</span>
                      <input 
                        type="number" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(Math.min(Number(e.target.value) || 0, maxPrice - 100))}
                        className="w-14 text-xs font-bold text-gray-800 bg-transparent outline-none p-0 text-right appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="100"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Max Price</label>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-200 focus-within:border-primary transition-colors">
                      <span className="text-xs text-gray-500 font-medium">৳</span>
                      <input 
                        type="number" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Math.max(Number(e.target.value) || 0, minPrice + 100))}
                        className="w-14 text-xs font-bold text-gray-800 bg-transparent outline-none p-0 text-right appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs">Product Categories</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm">
                  <Link href={`/category/all`} className={`${slug.toLowerCase() === 'all' ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary transition-colors'}`}>
                    All Products
                  </Link>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    {allCategories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
                  </span>
                </li>
                {allCategories.map(cat => (
                  <li key={cat.slug} className="flex justify-between items-center text-sm">
                    <Link href={`/category/${cat.slug}`} className={`${slug.toLowerCase() === cat.slug ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary transition-colors'}`}>
                      {cat.name}
                    </Link>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{cat.count || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="relative w-full sm:w-72">
                 <input type="text" placeholder={`Search in ${category?.name || 'Category'}...`} className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700" />
                 <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
               </div>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="w-full sm:w-auto bg-gray-50 border border-gray-100 rounded-full py-2.5 px-5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer relative shadow-sm"
                 >
                   <option value="newest">Newest Arrivals</option>
                   <option value="price_asc">Price: Low to High</option>
                   <option value="price_desc">Price: High to Low</option>
                 </select>
               </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
              <div className="text-center py-24 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-lg p-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 z-0" />
                 <div className="relative z-10">
                   <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                     <ShoppingBag className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                   </div>
                   <h2 className="text-2xl font-serif font-normal text-gray-900 mb-3 tracking-widest uppercase">No Products Found</h2>
                   <p className="text-gray-500 max-w-md mx-auto mb-8 font-light leading-relaxed tracking-wide">
                     We're currently refreshing our {category?.name} collection. Beautiful things take time—check back soon!
                   </p>
                   <Link href="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all duration-300 shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                     Explore Collection
                   </Link>
                 </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6 md:mb-8 border-b pb-3 border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 md:gap-x-5 md:gap-y-8">
                  {products.map((product: any) => (
                    <ProductCard 
                      key={product._id}
                      id={product._id}
                      brand={product.brand}
                      name={product.name}
                      price={product.price}
                      discountPrice={product.discountPrice}
                      imageUrl={product.images && product.images.length > 0 ? product.images[0] : null}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = React.use(params);
  return <CategoryContent slug={slug} />;
}

"use client";
import React, { useEffect, useState, use } from 'react';
import { cachedGet } from '@/utils/apiCache';
import ProductCard from '@/components/ProductCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export default function BrandDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandAndProducts = async () => {
      setLoading(true);
      try {
        // 1. Fetch brand details by slug
        const { data: brandData } = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/brands/${slug}`);
        setBrand(brandData);

        // 2. Fetch products for this brand
        if (brandData && brandData.name) {
          const { data: productData } = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?brand=${encodeURIComponent(brandData.name)}`);
          setProducts(productData);
        }
      } catch (error) {
        console.error("Error fetching brand details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrandAndProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">Brand Not Found</h2>
        <Link href="/brands" className="text-primary hover:text-gray-900 font-medium">Return to Brands</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/30 pb-24">
      {/* Brand Hero Section */}
      <div className="bg-white border-b border-gray-100 py-16 mb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/brands" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brands
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
            {/* Brand Logo */}
            <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-center overflow-hidden">
              {brand.image ? (
                <img src={brand.image} alt={brand.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-6xl text-primary/20 font-serif">{brand.name.charAt(0)}</span>
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1 max-w-2xl">
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 block">Brand Story</span>
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 uppercase tracking-widest mb-4">
                {brand.name}
              </h1>
              {brand.description ? (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {brand.description}
                </p>
              ) : (
                <p className="text-gray-400 italic">No description available for this brand.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8 pb-4">
           <h2 className="text-2xl font-serif font-medium uppercase tracking-widest text-gray-900">
             Shop {brand.name}
           </h2>
           <span className="text-sm font-medium text-gray-500">{products.length} Products</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-500">We currently do not have any products in stock from {brand.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product: any) => (
              <ProductCard 
                key={product._id}
                id={product._id}
                brand={product.brand}
                name={product.name}
                price={product.price}
                discountPrice={product.discountPrice}
                imageUrl={product.images ? product.images[0] : null}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

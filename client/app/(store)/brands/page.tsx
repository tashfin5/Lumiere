"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cachedGet } from '@/utils/apiCache';
import { Loader2 } from 'lucide-react';

interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isFeatured?: boolean;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/brands`);
        setBrands(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const trendingBrands = brands.filter(b => b.isFeatured);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  const getBrandsByLetter = (letter: string) => {
    return brands.filter(b => b.name.toUpperCase().startsWith(letter)).sort((a, b) => a.name.localeCompare(b.name));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/30 pb-24">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 py-16">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">Directory</span>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 uppercase tracking-widest mb-6">
            Our Brands
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium">
            Discover our curated collection of the world's most sought-after beauty, skincare, and fragrance brands.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl pt-16">
        
        {/* Trending Brands */}
        {trendingBrands.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
               <h2 className="text-2xl font-serif font-medium uppercase tracking-widest text-gray-900">Featured Brands</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingBrands.map((brand) => (
                <Link href={`/brands/${brand.slug}`} key={brand._id} className="group cursor-pointer">
                  <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative border border-gray-100 shadow-sm">
                    {brand.image ? (
                      <>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors z-10" />
                        <img src={brand.image} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-cream flex items-center justify-center">
                        <span className="text-4xl text-primary/20 font-serif">{brand.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <h3 className={`font-serif font-medium text-xl uppercase tracking-widest text-center px-4 ${brand.image ? 'text-white drop-shadow-md' : 'text-gray-900'}`}>
                        {brand.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* A-Z Directory */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
             <h2 className="text-2xl font-serif font-medium uppercase tracking-widest text-gray-900">Brand Directory</h2>
          </div>
          
          {/* Alphabet Navigation */}
          <div className="flex flex-wrap gap-2 mb-12">
            {alphabet.map((letter) => {
              const hasBrands = getBrandsByLetter(letter).length > 0;
              return (
                <a 
                  key={letter} 
                  href={hasBrands ? `#letter-${letter}` : undefined}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    hasBrands 
                      ? 'bg-white border border-gray-200 text-gray-900 hover:border-primary hover:text-primary shadow-sm cursor-pointer' 
                      : 'bg-transparent text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </a>
              );
            })}
          </div>

          {/* Directory Listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {alphabet.map((letter) => {
              const brands = getBrandsByLetter(letter);
              if (brands.length === 0) return null;
              
              return (
                <div key={letter} id={`letter-${letter}`} className="scroll-mt-32">
                  <h3 className="text-3xl font-serif font-medium text-primary border-b border-pink-100 pb-2 mb-6">
                    {letter}
                  </h3>
                  <ul className="space-y-4">
                    {brands.map((brand) => (
                      <li key={brand._id}>
                        <Link 
                          href={`/brands/${brand.slug}`}
                          className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm hover:pl-2 duration-300 inline-block"
                        >
                          {brand.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}

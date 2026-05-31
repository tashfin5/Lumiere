"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { cachedGet } from '@/utils/apiCache';
import ProductCard from '@/components/ProductCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q'); // Gets the 'q' from /search?q=snail
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // Fetch from our newly updated backend route
        const { data } = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?keyword=${q || ''}`);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error searching products:", error);
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [q]);

  return (
    <main className="min-h-screen bg-gray-50/30 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="mb-8 border-b border-gray-200 pb-6 text-center">
          <h1 className="text-3xl font-serif font-medium uppercase tracking-widest text-secondary mb-2">
            Search Results
          </h1>
          <p className="text-gray-500 font-medium">
            {loading ? "Searching..." : `Found ${products.length} results for "${q}"`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-500">We couldn't find anything matching "{q}". Try checking your spelling or using more general terms.</p>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
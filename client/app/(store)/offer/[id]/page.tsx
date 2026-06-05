"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { cachedGet } from '@/utils/apiCache';
import { Loader2, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

export default function OfferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddBundle = (bundle: any) => {
    if (!bundle.products || bundle.products.length === 0) return;
    
    bundle.products.forEach((product: any) => {
      addToCart({
        _id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images?.[0],
        quantity: 1
      });
    });
    
    toast.success(`Added ${bundle.bundleName} to cart!`);
  };

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const { data } = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/offers/${id}`);
        setOffer(data);
      } catch (error) {
        console.error('Failed to load offer details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Offer not found</h1>
        <Link href="/" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Elegant Header */}
      <div className="w-full bg-primary/5 border-b border-primary/10 py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Tag className="w-40 h-40 text-primary" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-4 uppercase tracking-widest">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 uppercase tracking-widest mb-3">
            {offer.title}
          </h1>
          {offer.description && (
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm">
              {offer.description}
            </p>
          )}
        </div>
      </div>

      {/* Offer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 space-y-16">
        
        {/* Standard Products */}
        {offer.products?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-serif uppercase tracking-widest text-gray-800">Featured on Sale</h2>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{offer.products.length} Items</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {offer.products.map((product: any) => (
                <ProductCard key={product._id} id={product._id} slug={product.slug} brand={product.brand} name={product.name} price={product.price} discountPrice={product.discountPrice} imageUrl={product.images?.[0]} />
              ))}
            </div>
          </section>
        )}

        {/* BOGO Deals */}
        {(offer.bogoBuyProducts?.length > 0 || offer.bogoGetProducts?.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-serif uppercase tracking-widest text-primary">Buy One, Get One</h2>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">BOGO Deal</span>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Buy These */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                  Buy Any Of These
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {offer.bogoBuyProducts?.map((product: any) => (
                    <ProductCard key={product._id} id={product._id} slug={product.slug} brand={product.brand} name={product.name} price={product.price} discountPrice={product.discountPrice} imageUrl={product.images?.[0]} />
                  ))}
                </div>
              </div>
              
              {/* Get These Free */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                  Get These Free
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {offer.bogoGetProducts?.map((product: any) => (
                    <ProductCard key={product._id} id={product._id} slug={product.slug} brand={product.brand} name={product.name} price={product.price} discountPrice={product.discountPrice} imageUrl={product.images?.[0]} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Bundles */}
        {offer.bundles?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-serif uppercase tracking-widest text-gray-800">Special Bundles</h2>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{offer.bundles.length} Bundles</span>
            </div>
            <div className="space-y-8">
              {offer.bundles.map((bundle: any, index: number) => {
                const originalTotal = bundle.products?.reduce((sum: number, p: any) => sum + (p.price || 0), 0) || 0;
                
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-serif font-medium text-gray-900">{bundle.bundleName}</h3>
                        <p className="text-sm text-gray-500 mt-1">{bundle.products?.length || 0} items included</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">৳{bundle.bundlePrice}</p>
                          {originalTotal > bundle.bundlePrice && (
                            <p className="text-sm text-gray-400 line-through">৳{originalTotal}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => handleAddBundle(bundle)}
                          className="bg-gray-900 hover:bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 active:scale-95 whitespace-nowrap shrink-0"
                        >
                          Add Bundle
                        </button>
                      </div>
                    </div>
                    <div className="p-6 overflow-x-auto">
                      <div className="flex gap-6 min-w-max">
                        {bundle.products?.map((product: any) => (
                          <div key={product._id} className="w-48 shrink-0">
                            <ProductCard id={product._id} slug={product.slug} brand={product.brand} name={product.name} price={product.price} discountPrice={product.discountPrice} imageUrl={product.images?.[0]} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!offer.products?.length && !offer.bogoBuyProducts?.length && !offer.bogoGetProducts?.length && !offer.bundles?.length) && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 font-medium">No products have been added to this offer yet.</p>
            <Link href="/shop" className="inline-block mt-4 text-primary font-bold hover:underline">
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

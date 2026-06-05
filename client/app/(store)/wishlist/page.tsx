"use client";
import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function WishlistPage() {
  const { userInfo, toggleWishlist } = useAuthStore();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch populated wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userInfo) {
        setLoading(false);
        return;
      }
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        };
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`, config);
        setWishlistItems(data.wishlist || []);
      } catch (error) {
        console.error("Error fetching wishlist", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userInfo]);

  const handleRemove = async (id: string) => {
    // Optimistic UI update
    setWishlistItems(prev => prev.filter(item => item._id !== id));
    // Backend sync
    await toggleWishlist(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <main className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2 uppercase tracking-widest">Login Required</h2>
          <p className="text-gray-500 mb-6 font-medium">Please login to view your wishlist.</p>
          <Link href="/login" className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg block text-center">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-serif font-medium text-gray-900 uppercase tracking-widest mb-2">My Wishlist</h1>
        <p className="text-gray-500 text-sm mb-8 font-medium">You have {wishlistItems.length} items in your wishlist.</p>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map((item) => (
              <ProductCard 
                key={item._id}
                id={item._id.toString()}
                slug={item.slug}
                brand={item.brand}
                name={item.name}
                price={item.price}
                discountPrice={item.discountPrice}
                imageUrl={item.images ? item.images[0] : null}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-6 font-medium">Your wishlist is completely empty.</p>
            <Link href="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-colors text-xs shadow-md">
              Discover Products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
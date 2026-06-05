"use client";
import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, getCartCalculations } = useCartStore();
  
  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const FREE_SHIPPING_THRESHOLD = 5000;
  const { subtotal, discounts, total: currentTotal } = getCartCalculations();
  const progressPercentage = Math.min(100, (currentTotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountRemaining = FREE_SHIPPING_THRESHOLD - currentTotal;

  return (
    <>
      {/* Dark Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-accent z-[60] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-serif font-medium uppercase tracking-widest text-secondary flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" strokeWidth={1.5} />
            Your Bag
            <span className="font-sans font-bold text-[11px] bg-primary/10 text-primary min-w-[24px] h-[24px] px-1.5 rounded-full ml-1 flex items-center justify-center">
              {cart.length}
            </span>
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 hover:bg-pink-50 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {cart.length > 0 && (
          <div className="px-5 py-3 bg-pink-50/30 border-b border-gray-100">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-gray-700">
                {amountRemaining > 0 
                  ? <>You're <span className="text-primary font-bold">৳{amountRemaining}</span> away from Free Shipping!</>
                  : <span className="text-green-600">You've unlocked Free Shipping! 🎉</span>}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${amountRemaining <= 0 ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-6 pb-20">
              <div className="w-24 h-24 bg-pink-50/50 border border-pink-100 rounded-full flex items-center justify-center text-primary mb-2 shadow-sm animate-[bounce_3s_infinite]">
                <PackageSearch className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">Your bag is empty</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">Looks like you haven't added anything to your bag yet. Let's change that!</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-full max-w-[220px] bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg mt-4 text-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item._id} className="flex gap-4 group">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-50 rounded-md border border-gray-100 overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{item.brand}</span>
                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug pr-4">{item.name}</h3>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-end justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded h-8">
                        <button onClick={() => decreaseQuantity(item._id)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-primary transition"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item._id)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-primary transition"><Plus className="w-3 h-3" /></button>
                      </div>
                      
                      {/* Price */}
                      <span className="font-bold text-secondary">৳{(item.discountPrice || item.price) * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between text-gray-800">
              <span className="font-bold">Subtotal</span>
              <span className="font-bold">৳{subtotal}</span>
            </div>
            
            {discounts.map((discount, idx) => (
              <div key={idx} className="flex items-center justify-between text-green-600">
                <span className="text-sm flex items-center gap-1">
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Offer</span>
                  {discount.title}
                </span>
                <span className="font-bold text-sm">-৳{discount.discountAmount}</span>
              </div>
            ))}

            <div className="flex items-center justify-between text-gray-900 border-t border-gray-200 pt-3">
              <span className="font-bold uppercase tracking-widest">Total</span>
              <span className="text-xl font-serif font-medium text-secondary">৳{currentTotal}</span>
            </div>
            <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout.</p>
            <Link 
              href="/checkout"
              onClick={onClose}
              className="w-full bg-primary text-white py-4 rounded-md font-bold uppercase tracking-widest flex items-center justify-center hover:bg-black transition-colors shadow-lg text-center"
            >
              Checkout Now
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
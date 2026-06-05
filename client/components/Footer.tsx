"use client";
import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pt-20 pb-10 text-sm relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">

          {/* Brand & About */}
          <div className="flex flex-col space-y-6">
            <Link href="/" className="text-3xl font-serif font-medium text-accent tracking-widest">
              LUMIÈRE<span className="text-accent/70">.</span>
            </Link>
            <p className="text-accent/80 leading-relaxed font-light tracking-wide">
              Your ultimate destination for authentic K-Beauty and premium cosmetics. We bring the best of global skincare right to your doorstep.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-accent/20 bg-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-primary transition-all shadow-sm">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-accent/20 bg-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-primary transition-all shadow-sm">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-accent/20 bg-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-primary transition-all shadow-sm">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:justify-self-center">
            <h3 className="text-accent font-serif font-normal text-lg tracking-widest mb-6">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4 text-accent/80 font-light tracking-wide">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/category/all" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link href="/brands" className="hover:text-white transition-colors">Brands</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link href="/checkout" className="hover:text-white transition-colors">Checkout</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-accent font-serif font-normal text-lg tracking-widest mb-6">Contact Us</h3>
            <ul className="space-y-4 text-accent/80">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Level 4, Lumière Tower, Narayanganj, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <span>+880 1941 682148</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <span>support@lumiere.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-accent/20 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-accent/70 text-[10px] uppercase tracking-widest font-medium">
          <p>&copy; {new Date().getFullYear()} Lumière Cosmetics. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
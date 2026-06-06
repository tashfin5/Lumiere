"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';

export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const trackView = async () => {
      try {
        const isFirstSiteView = !sessionStorage.getItem('site_viewed');
        if (isFirstSiteView) {
          sessionStorage.setItem('site_viewed', 'true');
        }

        const viewedKey = `viewed_${pathname}`;
        if (!sessionStorage.getItem(viewedKey)) {
          sessionStorage.setItem(viewedKey, 'true');
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stats/track`, { 
            pathname,
            isFirstSiteView
          });
        }
      } catch (error) {
        console.error('Failed to track site view', error);
      }
    };
    
    // Only run on the client
    if (typeof window !== 'undefined') {
      trackView();
    }
  }, [pathname]);

  return null;
}

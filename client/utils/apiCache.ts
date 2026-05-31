import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedGet = async (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
  const cacheKey = config ? `${url}_${JSON.stringify(config)}` : url;
  
  const entry = cache.get(cacheKey);
  const now = Date.now();

  // If cache exists and hasn't expired, return it wrapped in an object like AxiosResponse
  if (entry && now - entry.timestamp < CACHE_DURATION) {
    return { data: entry.data } as AxiosResponse;
  }

  // Otherwise, fetch fresh data
  const res = await axios.get(url, config);
  
  // Save to cache
  cache.set(cacheKey, {
    data: res.data,
    timestamp: now,
  });

  return res;
};

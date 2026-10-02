import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  params: Record<string, string>;
}

function parseHash(): RouteState {
  try {
    const rawHash = (typeof window !== 'undefined' ? window.location.hash : '') || '';
    let hash = rawHash.replace(/^#/, '').split('?')[0].trim();
    if (!hash || hash === '') hash = '/';
    if (!hash.startsWith('/')) hash = '/' + hash;

    // Example matching: /product/p1 or /track/SSBD-1024
    const productMatch = hash.match(/^\/product\/(.+)$/);
    if (productMatch) {
      return { path: '/product', params: { id: decodeURIComponent(productMatch[1]) } };
    }

    const trackMatch = hash.match(/^\/track\/(.+)$/);
    if (trackMatch) {
      return { path: '/track', params: { id: decodeURIComponent(trackMatch[1]) } };
    }

    return { path: hash, params: {} };
  } catch (err) {
    console.error('Error parsing route hash:', err);
    return { path: '/', params: {} };
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState<RouteState>(parseHash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newPath: string) => {
    try {
      window.location.hash = newPath;
    } catch (e) {
      console.error('Navigation error:', e);
    }
  };

  return { route, navigate };
}

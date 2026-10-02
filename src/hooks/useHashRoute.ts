import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  params: Record<string, string>;
}

function parseHash(): RouteState {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  
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
    window.location.hash = newPath;
  };

  return { route, navigate };
}

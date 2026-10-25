import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Admin scrolls inside <main>, independently of the browser window.
    document.querySelector('.admin-shell main')?.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePageTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const trackPageView = async () => {
      if (user && location.pathname !== lastTrackedPath.current) {
        // Avoid logging auth page or rapid re-logs of the same page
        if (location.pathname === '/auth') return;

        lastTrackedPath.current = location.pathname;
        
        const { error } = await supabase.from('sys_page_views').insert({
          path: location.pathname,
          user_id: user.id,
        });

        if (error) {
          console.error('Error tracking page view:', error);
        }
      }
    };

    // Track after a short delay to ensure the user is settled on the page
    const timeoutId = setTimeout(trackPageView, 500);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, user]);
};

// A component to easily drop into the layout
export const PageTracker = () => {
  usePageTracking();
  return null;
};
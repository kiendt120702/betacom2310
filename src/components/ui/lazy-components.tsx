
/**
 * Lazy-loaded heavy UI components to reduce initial bundle size
 */

import React from 'react';

// Lazy load heavy Radix components that aren't used immediately
export const LazyAlertDialog = React.lazy(() => 
  import('@radix-ui/react-alert-dialog').then(module => ({
    default: module.AlertDialog
  }))
);

export const LazyDropdownMenu = React.lazy(() =>
  import('@radix-ui/react-dropdown-menu').then(module => ({
    default: module.DropdownMenu
  }))
);

export const LazyTabs = React.lazy(() =>
  import('@radix-ui/react-tabs').then(module => ({
    default: module.Tabs
  }))
);

export const LazyAccordion = React.lazy(() =>
  import('@radix-ui/react-accordion').then(module => ({
    default: module.Accordion
  }))
);

export const LazyHoverCard = React.lazy(() =>
  import('@radix-ui/react-hover-card').then(module => ({
    default: module.HoverCard
  }))
);

export const LazyMenubar = React.lazy(() =>
  import('@radix-ui/react-menubar').then(module => ({
    default: module.Menubar
  }))
);

export const LazyNavigationMenu = React.lazy(() =>
  import('@radix-ui/react-navigation-menu').then(module => ({
    default: module.NavigationMenu
  }))
);

export const LazyCarousel = React.lazy(() =>
  import('@/components/ui/carousel').then(module => ({
    default: module.Carousel
  }))
);

// Suspense wrapper for lazy components
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>
) => {
  const WrappedComponent = (props: P) => (
    <React.Suspense fallback={fallback}>
      <Component {...props} />
    </React.Suspense>
  );
  
  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Pre-configured lazy components with suspense
export const SuspensedAlertDialog = withSuspense(LazyAlertDialog);
export const SuspensedDropdownMenu = withSuspense(LazyDropdownMenu);
export const SuspensedTabs = withSuspense(LazyTabs);
export const SuspensedAccordion = withSuspense(LazyAccordion);
export const SuspensedCarousel = withSuspense(LazyCarousel);

// For development - preload components on hover/focus
export const preloadComponent = (importFn: () => Promise<any>) => {
  let preloaded = false;
  
  return {
    onMouseEnter: () => {
      if (!preloaded) {
        preloaded = true;
        importFn().catch(() => {
          preloaded = false; // Reset on error
        });
      }
    },
    onFocus: () => {
      if (!preloaded) {
        preloaded = true;
        importFn().catch(() => {
          preloaded = false; // Reset on error
        });
      }
    }
  };
};

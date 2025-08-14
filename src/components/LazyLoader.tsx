import React, { Suspense, ComponentType } from 'react';
import PageLoader from './PageLoader';

interface LazyLoaderProps {
  children: React.ComponentType<any>;
  fallback?: React.ComponentType;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  children: Component, 
  fallback: Fallback = PageLoader 
}) => {
  return (
    <Suspense fallback={<Fallback />}>
      <Component />
    </Suspense>
  );
};

export const withLazyLoader = <P extends object>(
  Component: ComponentType<P>,
  fallback?: ComponentType
) => {
  return React.memo((props: P) => (
    <LazyLoader children={() => <Component {...props} />} fallback={fallback} />
  ));
};
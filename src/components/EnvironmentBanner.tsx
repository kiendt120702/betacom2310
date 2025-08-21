import React from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { cn } from '@/lib/utils';

const EnvironmentBanner: React.FC = () => {
  const { isStaging, environmentName } = useEnvironment();

  if (!isStaging) {
    return null; // Only show banner for staging environment
  }

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[9999] text-center py-1 text-sm font-semibold text-white",
      environmentName === 'staging' ? "bg-orange-500" : "" // Orange for staging
    )}>
      MÔI TRƯỜNG STAGING
    </div>
  );
};

export default EnvironmentBanner;
import React from 'react';

const StagingBanner: React.FC = () => {
  const appEnv = import.meta.env.VITE_APP_ENV;

  if (appEnv === 'staging') {
    return (
      <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center text-sm py-1.5 z-[9999] font-semibold shadow-md">
        MÔI TRƯỜNG STAGING
      </div>
    );
  }
  return null;
};

export default StagingBanner;
import { useMemo } from 'react';

interface Environment {
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  environmentName: 'development' | 'production' | 'staging';
}

export const useEnvironment = (): Environment => {
  const environment = useMemo(() => {
    const appEnv = import.meta.env.VITE_APP_ENV;
    const isProdBuild = import.meta.env.PROD;

    let environmentName: 'development' | 'production' | 'staging';

    if (appEnv === 'staging') {
      environmentName = 'staging';
    } else if (isProdBuild) {
      environmentName = 'production';
    } else {
      environmentName = 'development';
    }

    return {
      isDevelopment: environmentName === 'development',
      isProduction: environmentName === 'production',
      isStaging: environmentName === 'staging',
      environmentName,
    };
  }, []);

  return environment;
};
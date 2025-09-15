import React, { useEffect, useState } from 'react';
import { ConfigContext, type AppConfig } from './config';

const defaultConfig: AppConfig = {
  encoreApiUrl: import.meta.env.VITE_ENCORE_API_URL || 'http://localhost:8080',
  bearerToken: import.meta.env.VITE_ENCORE_BEARER_TOKEN || '',
};

interface ConfigProviderProps {
  children: React.ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    // Try to load config from localStorage first
    const saved = localStorage.getItem('encore-ui-config');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        return { ...defaultConfig, ...parsedConfig };
      } catch (error) {
        console.warn('Failed to parse saved config, using defaults:', error);
      }
    }
    return defaultConfig;
  });

  useEffect(() => {
    // Save config to localStorage whenever it changes
    localStorage.setItem('encore-ui-config', JSON.stringify(config));
  }, [config]);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('encore-ui-config');
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
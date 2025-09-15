import { createContext } from 'react';

export interface AppConfig {
  encoreApiUrl: string;
  bearerToken?: string;
}

export interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  resetConfig: () => void;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);
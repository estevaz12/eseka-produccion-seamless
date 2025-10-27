import React, { createContext, useContext } from 'react';
import { ConfigContextType } from './types';

interface ConfigContextProps {
  children: React.ReactNode;
  config: ConfigContextType;
}

export const ConfigContext = createContext<ConfigContextType | null>(null);

export const ConfigProvider = ({ children, config }: ConfigContextProps) => {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = () => {
  return useContext(ConfigContext);
};

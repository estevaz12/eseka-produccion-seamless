import { createContext, useContext } from 'react';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children, config }) => {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = () => {
  return useContext(ConfigContext);
};

import { createContext } from 'react';
import { DatesContexType, ToastsContextType } from './types';

export const ErrorContext = createContext(false);
export const DatesContext = createContext<DatesContexType | null>(null);
export const ToastsContext = createContext<ToastsContextType | null>(null);

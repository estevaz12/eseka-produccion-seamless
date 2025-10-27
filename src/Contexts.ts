import { Dayjs } from 'dayjs';
import { createContext } from 'react';
import { Toast } from './types';

interface DatesContexType {
  startDate: Dayjs;
  fromMonthStart: boolean;
  endDate: Dayjs | null;
}

interface ToastsContextType {
  addToast: (toast: Toast) => void;
  removeToast: (toast: Toast) => void;
}

export const ErrorContext = createContext(false);
export const DatesContext = createContext<DatesContexType | null>(null);
export const ToastsContext = createContext<ToastsContextType | null>(null);

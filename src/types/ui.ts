import { Dayjs } from 'dayjs';

export type FooterRow = object;
export type TableRow = object;

export interface ConfigContextType {
  readonly apiUrl: string;
  readonly sqlDateFormat: string;
}

export interface DatesContexType {
  startDate: Dayjs;
  fromMonthStart: boolean;
  endDate: Dayjs | null;
}

export interface PDFCol {
  readonly id: string;
  readonly label: string;
  readonly align: 'left' | 'center' | 'right';
}

export interface TableCol {
  readonly id: string;
  readonly label: string;
  readonly labelWidth?: string;
  readonly align?: 'left' | 'center' | 'right';
  readonly pdfAlign?: 'left' | 'center' | 'right';
  readonly width?: string;
  readonly pdfValue?: (row: object) => number;
  readonly pdfRender?: (row: object) => string;
  readonly sortFn?: (a: object, b: object, order: 'asc' | 'desc') => number;
}

export interface Toast {
  type: 'danger' | 'success' | 'warning';
  message: string;
  duration?: number | null;
  machCode?: number;
}

export interface ToastsContextType {
  addToast: (toast: Toast) => void;
  removeToast: (toast: Toast) => void;
}

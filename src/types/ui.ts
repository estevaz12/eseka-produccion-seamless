import { Dayjs } from 'dayjs';
import { Dispatch, JSX, SetStateAction } from 'react';
import { MachineParsed } from './api';
import { Room } from './db';

export type CompareLoadType = 'update' | 'insert';
export type FooterRow = object;
export type RenderRowArgs<T> = [
  row: T,
  i: number,
  opened: string,
  handleClick: () => void,
];
export type RenderRowTuple = [string | null, JSX.Element];
export type TableRow = object;
export type SetStateType<T> = Dispatch<SetStateAction<T>>;

export interface ConfigContextType {
  readonly apiUrl: string;
  readonly sqlDateFormat: string;
}

export interface DatesContexType {
  startDate: Dayjs;
  fromMonthStart: boolean;
  endDate: Dayjs | null;
}

export interface NotifOpts {
  title: string;
  body: string;
  timeoutType: 'default' | 'never';
}

export interface OutletContextType {
  readonly addColorCodes: (newCodes: MachineParsed[]) => void;
  readonly room: Room;
  readonly docena: 12 | 24;
  readonly porcExtra: 1.01 | 1.02;
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

export interface ToastsContextType {
  addToast: (toast: ToastType) => void;
  removeToast: (id: string) => void;
}

export interface ToastType {
  readonly id?: string;
  readonly timestamp?: number;
  type: 'danger' | 'success' | 'warning';
  message: string;
  duration?: number | null;
  machCode?: number;
}

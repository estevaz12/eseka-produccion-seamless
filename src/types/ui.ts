export interface Cols {
  id: string;
  label: string;
  labelWidth: string;
  align: 'left' | 'center' | 'right';
  pdfAlign: 'left' | 'center' | 'right';
  width: string;
  pdfValue: (row: object) => number;
  pdfRender: (row: object) => string;
  sortFn: (a: object, b: object, order: 'asc' | 'desc') => number;
}

import { Machine, Room } from './db';

export interface MachineParsed extends Machine {
  StyleCode: StyleCode;
}

export interface StyleCode {
  styleCode: string;
  articulo: number;
  punto: string;
  tipo: string | null;
  talle: number;
  color: string;
  colorId: number;
}

export interface ProduccionParams {
  room: Room;
  startDate: string;
  endDate: string;
  actual: boolean;
  articulo: string;
  talle: string;
  colorId: string;
}

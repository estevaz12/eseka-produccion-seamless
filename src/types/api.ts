import { Machine, ProgColor, Room } from './db';

export interface MachineParsed extends Machine {
  readonly StyleCode: StyleCode;
}

export interface StyleCode {
  readonly styleCode: string;
  readonly articulo: number;
  readonly punto: string;
  readonly tipo: string | null;
  readonly talle: number;
  readonly color: string;
  readonly colorId: number;
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

export interface ProgColorTable extends ProgColor {
  readonly Machines: MachineParsed[];
}

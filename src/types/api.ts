import { Machine, ProgColor, Room } from './db';

export interface MachineParsed {
  readonly MachCode: number;
  readonly StyleCode: StyleCode;
  readonly Pieces: number;
  readonly TargetOrder: number;
  readonly State: number;
  readonly IdealCycle: number;
  readonly WorkEfficiency: number;
  readonly RoomCode: string;
}

export interface StyleCode {
  readonly styleCode: string;
  readonly articulo: number | string;
  readonly punto: string;
  readonly tipo: string | null;
  readonly talle: number;
  readonly color: string;
  readonly colorId: number;
}

export interface PDFProgRow {
  readonly articulo: number;
  readonly talle: number;
  readonly aProducir: number;
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

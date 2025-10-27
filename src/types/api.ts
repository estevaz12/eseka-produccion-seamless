import { ProgColor, Room } from './db';

export interface ColorCodeData {
  articulo: number;
  punto: string;
  tipo: string | null;
  talle: number;
  styleCode: string;
  color: number;
  code: string;
}

export interface ColorDistrData {
  color: number;
  porcentaje: number | string; // floats get converted to strings
}

export interface CompareProgData {
  added: PDFProgRow[];
  modified: PDFProgRow[];
  deleted: PDFProgRow[];
}

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

export interface NewArticulo {
  articuloExists: boolean;
  articulo: number;
  tipo: string | null;
  talles: number[];
  colorDistr: ColorDistrData[];
}

export interface NewTarget {
  machCode: number;
  styleCode: string;
  machTarget: number;
  prevProgTarget: number;
  newProgTarget: number;
  monthProduction: number;
  machPieces: number;
  sendTarget: number | string;
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

export interface ProgColorDocData {
  programadaId: number;
  colorDistrId: number;
  docenas: number;
}

export interface ProgColorTable extends ProgColor {
  readonly Producido: number;
  readonly Machines: MachineParsed[];
}

export interface ProgStartDateData {
  date: string;
  month: number;
  year: number;
}

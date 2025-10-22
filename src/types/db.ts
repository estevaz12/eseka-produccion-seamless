export type Room = 'HOMBRE' | 'SEAMLESS' | 'MUJER';

export interface CurrEffData {
  RoomCode: string;
  GroupCode: string;
  MachCode: number;
  TimeOn: number;
  TimeOff: number;
  WorkEfficiency: number;
  TimeEfficiency: number;
  [key: string]: any;
}

export interface Machine {
  MachCode: number;
  StyleCode: string | object;
  Pieces: number;
  TargetOrder: number;
  State: number;
  IdealCycle: number;
  WorkEfficiency: number;
  RoomCode: string;
}

export interface Produccion {
  Articulo: number;
  Tipo: string | null;
  Talle: number;
  Color: string;
  ColorId: number;
  Hex: string;
  WhiteText: boolean;
  Unidades: number;
}

export interface Programada {
  Id: number;
  Fecha: string;
  Articulo: number;
  Talle: number;
  Docenas: number;
  RoomCode: string;
}

export interface ProgColor {
  RoomCode: string;
  Fecha: string;
  Programada: number;
  ColorDistr: number;
  Articulo: number;
  Tipo: string | null;
  Talle: number;
  Color: string;
  ColorId: number;
  Hex: string;
  WhiteText: boolean;
  Porcentaje: number;
  Docenas: number;
  Unidades: number;
  Producido: number;
  Target: number;
  DocProg: number;
}

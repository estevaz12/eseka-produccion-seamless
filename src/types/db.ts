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

export interface Maquina {
  MachCode: number;
  StyleCode: string;
  Pieces: number;
  TargetOrder: number;
  State: number;
  IdealCycle: number;
  WorkEfficiency: number;
  RoomCode: string;
}

export interface Programada {
  Id: number;
  Fecha: string;
  Articulo: number;
  Talle: number;
  Docenas: number;
  RoomCode: string;
}

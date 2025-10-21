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

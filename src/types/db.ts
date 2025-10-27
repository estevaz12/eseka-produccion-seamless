import {
  ISqlTypeFactoryWithNoParams,
  ISqlTypeWithLength,
  ISqlTypeWithPrecisionScale,
} from 'mssql';

export type Room = 'HOMBRE' | 'SEAMLESS' | 'MUJER' | 'ELECTRONICA';

export interface Articulo {
  readonly Articulo: number;
  readonly Tipo: string | null;
}

export interface Color {
  readonly Id: number;
  readonly Color: string;
}

export interface ColorCode {
  readonly Articulo: number;
  readonly Talle: number;
  readonly Color: number;
  readonly Code: string;
  readonly StyleCode: string;
}

export interface ColorDistr {
  readonly Id: number;
  readonly Vigencia: string;
  readonly Articulo: number;
  readonly Talle: number;
  readonly Color: number;
  readonly Porcentaje: number;
}

export interface CurrEffData {
  readonly RoomCode: string;
  readonly GroupCode: string;
  readonly MachCode: number;
  readonly TimeOn: number;
  readonly TimeOff: number;
  readonly WorkEfficiency: number;
  readonly TimeEfficiency: number;
  readonly [key: string]: any;
}

export interface Machine {
  readonly MachCode: number;
  readonly StyleCode: string;
  readonly Pieces: number;
  readonly TargetOrder: number;
  readonly State: number;
  readonly IdealCycle: number;
  readonly WorkEfficiency: number;
  readonly RoomCode: string;
}

export interface Produccion {
  readonly Articulo: number;
  readonly Tipo: string | null;
  readonly Talle: number;
  readonly Color: string;
  readonly ColorId: number;
  readonly Hex: string;
  readonly WhiteText: boolean;
  readonly Unidades: number;
  readonly [keys: string]: any;
}

export interface ProductionsMonitorRow {
  readonly DateRec: string;
  readonly Shift: number;
  readonly MachCode: number;
  readonly StyleCode: string;
  readonly Pieces: number;
  readonly OrderPieces: number;
  readonly TargetPieces: number;
  readonly Discards: number;
}

export interface Programada {
  readonly Id: number;
  readonly Fecha: string;
  readonly Articulo: number;
  readonly Talle: number;
  readonly Docenas: number;
  readonly RoomCode: string;
}

export interface ProgColor {
  readonly RoomCode: string;
  readonly Fecha: string;
  readonly Programada: number;
  readonly ColorDistr: number;
  readonly Articulo: number;
  readonly Tipo: string | null;
  readonly Talle: number;
  readonly Color: string;
  readonly ColorId: number;
  readonly Hex: string;
  readonly WhiteText: boolean;
  readonly Porcentaje: number;
  readonly Docenas: number;
  readonly Unidades: number;
  readonly Producido: number;
  readonly Target: number;
  readonly DocProg: number;
}

export interface ProgLoadDate {
  readonly Date: string;
  readonly Month: number;
  readonly Year: number;
  readonly RoomCode: string;
}

export interface SQLQueryOpts {
  query: string;
  params: SQLQueryParam[];
}

export interface SQLQueryParam {
  readonly name: string;
  readonly type:
    | ISqlTypeFactoryWithNoParams
    | ISqlTypeWithLength
    | ISqlTypeWithPrecisionScale;
  readonly value: string | number;
}

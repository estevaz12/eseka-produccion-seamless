import {
  ISqlTypeFactoryWithLength,
  ISqlTypeFactoryWithNoParams,
  ISqlTypeFactoryWithPrecisionScale,
} from 'mssql';

export type Room = 'HOMBRE' | 'SEAMLESS' | 'MUJER';

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

export interface SQLQueryParam {
  readonly name: string;
  readonly type:
    | ISqlTypeFactoryWithLength
    | ISqlTypeFactoryWithNoParams
    | ISqlTypeFactoryWithPrecisionScale;
  readonly value: string | number;
}

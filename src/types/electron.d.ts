import { NotifOpts } from './ui';

export interface ElectronAPI {
  openFile: () => Promise<string | void>;
  openPath: (path: string) => Promise<string>;
  notifyElectronico: (opts: NotifOpts) => void;
  onPlayAlertSound: (
    callback: (times?: number, interval?: number) => void
  ) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};

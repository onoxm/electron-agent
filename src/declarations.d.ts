/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
import { WindowAction } from "./types";

declare module "*.css";

export interface IElectronAPI {
  windowAction: (action: WindowAction) => void;
  chatWithOllama: (options: AgentOptions) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

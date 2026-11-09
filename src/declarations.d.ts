/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
import { type AgentOptions, WindowAction } from "./types";

declare module "*.css";

export interface IElectronAPI {
  windowAction: (action: WindowAction) => void;
  chatWithAgent: (
    options: AgentOptions,
    onChunk: (content: string) => void,
    onDone?: () => void,
    onError?: (message: string) => void,
  ) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

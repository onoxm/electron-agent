// preload.js
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import {
  CHANNELS,
  WindowAction,
  type AgentOptions,
  type ChatStreamPayload,
} from "../types";

const apiKey = "electronAPI";

const api = {
  windowAction: (action: WindowAction) =>
    ipcRenderer.send(CHANNELS.WINDOW_ACTION, action),
  chatWithAgent: (
    options: AgentOptions,
    onChunk: (content: string) => void,
    onDone?: () => void,
    onError?: (message: string) => void,
  ) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const listener = (_event: IpcRendererEvent, payload: ChatStreamPayload) => {
      if (payload.requestId !== requestId) return;

      if (payload.type === "chunk") {
        onChunk(payload.content);
        return;
      }

      ipcRenderer.removeListener(CHANNELS.CHAT_WITH_AGENT_STREAM, listener);

      if (payload.type === "done") onDone?.();
      else onError?.(payload.message);
    };

    ipcRenderer.on(CHANNELS.CHAT_WITH_AGENT_STREAM, listener);
    ipcRenderer.send(CHANNELS.CHAT_WITH_AGENT, { ...options, requestId });
  },
} satisfies Window[typeof apiKey];

// 使用 contextBridge 安全地暴露有限、具体的 API
contextBridge.exposeInMainWorld(apiKey, api);

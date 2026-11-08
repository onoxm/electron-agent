// preload.js
import { contextBridge, ipcRenderer } from "electron";
import { CHANNELS, WindowAction, type AgentOptions } from "../types";

const apiKey = "electronAPI";

const api = {
  windowAction: (action: WindowAction) =>
    ipcRenderer.send(CHANNELS.WINDOW_ACTION, action),
  chatWithOllama: (options: AgentOptions) =>
    ipcRenderer.invoke(CHANNELS.CHAT_WITH_AGENT, options),
} satisfies Window[typeof apiKey];

// 使用 contextBridge 安全地暴露有限、具体的 API
contextBridge.exposeInMainWorld(apiKey, api);

import type { IpcMainEvent } from "electron";
import {
  CHANNELS,
  type ChatRequestOptions,
  type ChatStreamPayload,
} from "../../types";
import { api } from "../api";

const OLLAMA_CHAT_URL = "http://localhost:11434/api/chat";

/** 解析 Ollama 流式响应中的一行 NDJSON，返回本次新增的文本 */
const parseContent = (line: string): string => {
  if (!line.trim()) return "";

  try {
    return JSON.parse(line).message?.content ?? "";
  } catch {
    return "";
  }
};

export const chatWithOllama = {
  channel: CHANNELS.CHAT_WITH_AGENT,
  handle: async (
    event: IpcMainEvent,
    { model, messages, requestId }: ChatRequestOptions,
  ) => {
    const send = (payload: ChatStreamPayload) =>
      event.sender.send(CHANNELS.CHAT_WITH_AGENT_STREAM, payload);

    try {
      // returnType: null 时 data 是未读取的原始 Response，用于逐块读取流
      const { data: response } = await api.post<Response>(
        OLLAMA_CHAT_URL,
        {
          model,
          messages: [
            { role: "system", content: "你是一个友善的中文语言模型" },
            ...messages,
          ],
          stream: true,
        },
        { returnType: null },
      );

      if (!response.body) throw new Error("Ollama 响应中没有可读取的流");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Ollama 按行返回 NDJSON，最后一段可能不完整，留在 buffer 等下一块
        const lines = buffer.split("\n");

        console.log("buffer", buffer);
        console.log("lines", lines);

        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const content = parseContent(line);
          if (content) send({ requestId, type: "chunk", content });
        }
      }

      const content = parseContent(buffer);
      if (content) send({ requestId, type: "chunk", content });

      send({ requestId, type: "done" });
    } catch (error) {
      send({
        requestId,
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  },
};

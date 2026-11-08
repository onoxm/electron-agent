import { AgentOptions, CHANNELS } from "../../types";
import { api } from "../api";

export const chatWithOllama = {
  channel: CHANNELS.CHAT_WITH_AGENT,
  handle: async (_: any, {model, messages}: AgentOptions) => {
    const data = await api.post("http://localhost:11434/api/chat", {
      model,
      messages: [
        { role: "system", content: "你是一个友善的中文语言模型" },
        ...messages,
      ],
      stream: false,
    });

    return data.data;
  },
};

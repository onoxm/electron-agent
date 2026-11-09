export type Role = "user" | "assistant";
export type Message = { role: Role; content: string };

export const modelList = ["deepseek-r1", "llama3", "qwen3.8"] as const;

export type Model = (typeof modelList)[number];

export interface AgentOptions {
  model: Model;
  messages: Message[];
}

/** 主进程收到的流式请求参数，requestId 用于把响应分片对应回渲染进程的那次请求 */
export interface ChatRequestOptions extends AgentOptions {
  requestId: string;
}

/** 主进程推送给渲染进程的流式消息 */
export type ChatStreamPayload =
  | { requestId: string; type: "chunk"; content: string }
  | { requestId: string; type: "done" }
  | { requestId: string; type: "error"; message: string };

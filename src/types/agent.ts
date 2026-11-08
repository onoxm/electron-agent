export type Role = "user" | "assistant";
export type Message = { role: Role; content: string };
export type Model = "llama3" | "deepseek-r1" | "qwen3.8";

export interface AgentOptions {
  model: Model;
  messages: Message[];
}
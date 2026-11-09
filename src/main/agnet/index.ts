import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StateGraph } from "@langchain/langgraph";
import type { IpcMainEvent } from "electron";
import { AIMessage, BaseMessage, HumanMessage } from "langchain";
import { z } from "zod/v4";
import {
  CHANNELS,
  type ChatRequestOptions,
  type ChatStreamPayload,
} from "../../types";
import { createModel } from "./agent";

const schema = z.object({
  messages: z.array(z.custom<BaseMessage>()),
  llmCalls: z.number().optional(),
});

type TState = z.infer<typeof schema>;

export const chatWithAgent = {
  channel: CHANNELS.CHAT_WITH_AGENT,
  handle: async (
    event: IpcMainEvent,
    { model: modelName, messages, requestId }: ChatRequestOptions,
  ) => {
    const send = (payload: ChatStreamPayload) =>
      event.sender.send(CHANNELS.CHAT_WITH_AGENT_STREAM, payload);

    try {
      const model = createModel({ modelName });

      const pt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(
          "你是一个中文健谈的AI助手，请结合上下文尽可能详细地使用中文回答用户问题。",
        ),
        new MessagesPlaceholder("messages"),
      ]);

      const chain = pt.pipe(model);

      async function llmNode(state: TState) {
        const stream = await chain.stream({
          messages: state.messages,
        });

        let fullText = "";

        for await (const chunk of stream) {
          const content =
            typeof chunk.content === "string" ? chunk.content : "";

          if (!content) continue;

          fullText += content;
          send({ requestId, type: "chunk", content });
        }

        return {
          messages: [...state.messages, new AIMessage(fullText)],
          llmCalls: (state.llmCalls ?? 0) + 1,
        };
      }

      const graph = new StateGraph(schema)
        .addNode("llm", llmNode)
        .addEdge("__start__", "llm")
        .addEdge("llm", "__end__")
        .compile();

      await graph.invoke({
        messages: messages.map(({ role, content }) =>
          role === "user" ? new HumanMessage(content) : new AIMessage(content),
        ),
      });

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

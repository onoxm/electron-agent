import { useEffect, useRef, useState } from "react";
import { Message, Model, modelList, WindowAction } from "../types";

export default () => {
  const windowAction = window.electronAPI.windowAction;

  const [value, setValue] = useState("");
  const [model, setModel] = useState<Model>("deepseek-r1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!value || isStreaming) return;

    const currentMessages: Message[] = [
      ...messages,
      { role: "user", content: value },
    ];
    setValue("");
    // 先追加一条空的 assistant 消息，流式分片都往这条里拼
    setMessages([...currentMessages, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    window.electronAPI.chatWithAgent(
      {
        model,
        messages: currentMessages,
      },
      (content) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = {
            ...last,
            content: last.content + content,
          };
          return next;
        });
      },
      () => setIsStreaming(false),
      (message) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = {
            ...last,
            content: `${last.content}\n请求失败：${message}`,
          };
          return next;
        });
        setIsStreaming(false);
      },
    );
  };

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-between gap-4 p-4">
      <div className="flex items-center justify-center gap-4">
        <button
          className="cursor-pointer"
          onClick={() => windowAction(WindowAction.Minimize)}
        >
          minimize
        </button>
        <button
          className="cursor-pointer"
          onClick={() => windowAction(WindowAction.Maximize)}
        >
          maximize
        </button>
        <button
          className="cursor-pointer"
          onClick={() => windowAction(WindowAction.Close)}
        >
          close
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <div
          ref={messagesRef}
          className="w-[633px] flex flex-col gap-2 overflow-y-auto border border-gray-300 rounded-lg p-4 max-h-96 overflow-x-hidden overflow-y-auto"
        >
          {messages.map(({ role, content }, i) => (
            <p key={i}>
              <strong>{role}:</strong> {content}
            </p>
          ))}
        </div>

        <div>
          <input
            className="w-96 h-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Chat with Ollama..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />

          <select
            className="ml-4 cursor-pointer px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-300"
            disabled={isStreaming}
            value={model}
            onChange={(e) => setModel(e.target.value as Model)}
          >
            {modelList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <button
            className="cursor-pointer ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={isStreaming}
          >
            {isStreaming ? "生成中..." : "发送"}
          </button>
        </div>
      </div>
    </div>
  );
};

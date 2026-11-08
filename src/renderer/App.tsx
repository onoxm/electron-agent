import { useEffect, useRef, useState } from "react";
import { Message, Model } from "../types";

export default () => {
  const windowAction = window.electronAPI.windowAction;

  const [value, setValue] = useState("");
  const [model, setModel] = useState<Model>("deepseek-r1");
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesRef = useRef<HTMLDivElement>(null);

  const modelList: Model[] = ["deepseek-r1", "llama3", "qwen3.8"];

  const handleSendMessage = async () => {
    const currentMessages: Message[] = [
      ...messages,
      { role: "user", content: value },
    ];
    setValue("");
    setMessages(currentMessages);
    const data = (await window.electronAPI.chatWithOllama({
      model,
      messages: currentMessages,
    })) as {
      message: Message;
    };
    setMessages((prev) => [...prev, data.message]);
  };

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
      {/* <div className="flex items-center justify-center gap-4">
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
      </div> */}

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
            className="cursor-pointer ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleSendMessage}
          >
            send
          </button>
        </div>
      </div>
    </div>
  );
};

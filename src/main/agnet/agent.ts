import { ChatOllama } from "@langchain/ollama";
import { Model } from "../../types";

export const createModel = ({ modelName }: { modelName: Model }) => {
  return new ChatOllama({
    model: modelName,
    temperature: 0.5,
  });
};

import { type IpcMainEvent, type IpcMainInvokeEvent } from "electron";
import { chatWithAgent } from "../agnet";
import { windowBasicAction } from "./windowBasicAction";

interface IpcMainAction {
  on: {
    channel: string;
    handle: (event: IpcMainEvent, ...args: any[]) => void;
  }[];
  handle: {
    channel: string;
    handle: (event: IpcMainInvokeEvent, ...args: any[]) => void;
  }[];
}

export const ipcMainAction: IpcMainAction = {
  on: [chatWithAgent, windowBasicAction],
  handle: [
    {
      channel: "abc",
      handle: (event, action) => {},
    },
  ],
};

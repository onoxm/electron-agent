import {
  BrowserWindow,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
} from "electron";
import { CHANNELS, WindowAction } from "../types";
import { chatWithOllama } from "./agnet";

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
  on: [
    chatWithOllama,
    {
      channel: CHANNELS.WINDOW_ACTION,
      handle: (event, action) => {
        const window = BrowserWindow.fromWebContents(event.sender);

        switch (action) {
          case WindowAction.Close:
            window?.close();
            break;
          case WindowAction.Maximize:
            window?.maximize();
            break;
          case WindowAction.Minimize:
            window?.minimize();
            break;
        }
      },
    },
  ],
  handle: [
    {
      channel: "abc",
      handle: (event, action) => {},
    },
  ],
};

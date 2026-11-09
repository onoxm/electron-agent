import { BrowserWindow, IpcMainEvent } from "electron";
import { CHANNELS, WindowAction } from "../../types";

export const windowBasicAction = {
  channel: CHANNELS.WINDOW_ACTION,
  handle: (event: IpcMainEvent, action: WindowAction) => {
    const window = BrowserWindow.fromWebContents(event.sender);

    switch (action) {
      case WindowAction.Close:
        window?.close();
        break;
      case WindowAction.Maximize:
        if (window?.isMaximized()) window.unmaximize();
        else window?.maximize();
        break;
      case WindowAction.Minimize:
        window?.minimize();
        break;
    }
  },
};

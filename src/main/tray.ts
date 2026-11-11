import { app, Menu, nativeImage, Tray } from "electron";
import { platform } from "./platform";

export const createTray = () => {
  const logo = nativeImage.createFromPath(
    `${app.getAppPath()}/public/logo.png`,
  );
  if (platform.isMac) logo.setTemplateImage(true);
  const tray = new Tray(logo);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  return tray;
};

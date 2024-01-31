import { app, ipcMain } from "electron";
import Window from "../window";

class AppMessages {
	private screenshots = 0;

	public init = (window: Window) => {
		ipcMain.handle("app/mode-changed", window.applyMode);

		ipcMain.handle("app/pass-through/enable", window.enablePassThrough);
		ipcMain.handle("app/pass-through/disable", window.disablePassThrough);

		ipcMain.handle("app/screenshot", async () => {
			await window.capture(++this.screenshots);
		});

		ipcMain.handle("app/auto-hide/enable", window.enableAutoHide);
		ipcMain.handle("app/auto-hide/disable", window.disableAutoHide);

		ipcMain.handle("app/temp-path", () => app.getPath("temp"));

		ipcMain.on("app/path", (e) => {
			e.returnValue = app.getAppPath();
		});

		ipcMain.on("app/path/name", (e, name) => {
			e.returnValue = app.getPath(name);
		});

		ipcMain.on("app/window/size", (e) => {
			e.returnValue = window.data.getSize();
		});

		ipcMain.handle("app/window/show", () => window.data.show());
		ipcMain.handle("app/window/blur", () => window.data.blur());
		ipcMain.handle("app/window/minimize", () => window.data.minimize());

		ipcMain.handle("app/quit", () => app.exit());
	};
}

export default new AppMessages();

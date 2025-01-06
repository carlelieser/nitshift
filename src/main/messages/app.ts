import { app, ipcMain } from "electron";
import Window from "../window";

class AppMessages {
	public init = (window: Window) => {
		ipcMain.handle("app/mode-changed", window.applyMode);

		ipcMain.handle("app/pass-through/enable", window.enablePassThrough);
		ipcMain.handle("app/pass-through/disable", window.disablePassThrough);

		ipcMain.handle("app/screenshot", async () => {
			await window.capture();
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

		ipcMain.handle("app/window/size", () => {
			return window.ref.getSize();
		});

		ipcMain.on("app/window/offset/height", (_, height) => {
			window.setHeightOffset(height);
		});

		ipcMain.on("app/window/offset/width", (_, width) => {
			window.setWidthOffset(width);
		});

		ipcMain.on("app/window/readjust", () => {
			window.readjust();
		});

		ipcMain.handle("app/window/show", () => window.ref.show());
		ipcMain.handle("app/window/blur", () => window.ref.blur());
		ipcMain.handle("app/window/minimize", () => window.minimize());

		ipcMain.handle("app/quit", () => app.exit());
	};
}

export default new AppMessages();

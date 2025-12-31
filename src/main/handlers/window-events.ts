import { BrowserWindow, ipcMain, IpcMainEvent, screen } from "electron";
import Window from "../window";
import Updater from "../updater";
import Shader from "../shader";

interface WindowEventsDeps {
	window: Window;
	updater: Updater;
	shades: Shader;
}

export function setupWindowEvents(deps: WindowEventsDeps) {
	const { window, updater, shades } = deps;

	const handleWindowFocused = () => {
		window.ref.webContents.send("focused");
		updater.check();
		window.applyMode();
	};

	const handleWindowBlurred = () => {
		if (!window.autoHide || shades.anyFocused() || process.env.CAPTURE) return;
		if (!window.ref.isMinimized()) window.ref.webContents.send("blurred");
	};

	const handleWindowShown = () => {
		window.ref.webContents.send("focused");
	};

	window.on("window-created", (browserWindow: BrowserWindow) => {
		browserWindow.on("show", handleWindowShown);
		browserWindow.on("focus", handleWindowFocused);
		browserWindow.on("blur", handleWindowBlurred);
	});
}

export function setupIpcHandlers(deps: { updater: Updater }) {
	const { updater } = deps;

	ipcMain.on("app/check-for-updates", updater.check.bind(updater, true));

	ipcMain.on("screen/size", (e: IpcMainEvent) => {
		const { size, scaleFactor } = screen.getPrimaryDisplay();
		const width = size.width * scaleFactor;
		const height = size.height * scaleFactor;
		e.returnValue = { width, height };
	});
}

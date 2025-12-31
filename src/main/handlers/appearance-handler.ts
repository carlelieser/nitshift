import { BrowserWindow, nativeTheme } from "electron";

export class AppearanceHandler {
	private window: BrowserWindow | null = null;
	private syncEnabled = false;

	public setWindow(window: BrowserWindow) {
		this.window = window;
	}

	public setSyncEnabled(enabled: boolean) {
		if (enabled && !this.syncEnabled) {
			this.syncWithNativeTheme();
			nativeTheme.on("updated", this.syncWithNativeTheme);
		} else if (!enabled && this.syncEnabled) {
			nativeTheme.off("updated", this.syncWithNativeTheme);
		}
		this.syncEnabled = enabled;
	}

	private syncWithNativeTheme = () => {
		if (!this.window) return;
		const appearance = nativeTheme.shouldUseDarkColors ? "dark" : "light";
		this.window.webContents.send("appearance-updated", appearance);
	};
}

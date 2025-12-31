import Window from "../window";
import Updater from "../updater";
import TrayManager from "./tray-manager";
import Shader from "../shader";
import BrightnessManager from "./brightness-manager";
import Scheduler from "../scheduler";
import LaunchManager from "./launch-manager";
import { DisplayHandler } from "../handlers/display-handler";
import { AppearanceHandler } from "../handlers/appearance-handler";
import { setupWindowEvents, setupIpcHandlers } from "../handlers/window-events";
import { loadAutoUpdateCheck, loadSyncAppearance } from "@main/storage";
import {
	BrowserWindow,
	HeadersReceivedResponse,
	ipcMain,
	IpcMainEvent,
	OnHeadersReceivedListenerDetails,
	session
} from "electron";
import process from "process";
import path from "path";
import { isDev } from "@common/utils";
import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";

const MAIN_WINDOW_VITE_DEV_SERVER_URL = process.env["ELECTRON_RENDERER_URL"];

class AppManager {
	// Core managers
	public updater = new Updater();
	public tray = new TrayManager();
	public shades = new Shader();
	public brightness = new BrightnessManager(this.shades);
	public scheduler = new Scheduler();
	public launch = new LaunchManager();
	public window: Window;

	// Handlers
	private displayHandler: DisplayHandler;
	private appearanceHandler = new AppearanceHandler();

	private entry = MAIN_WINDOW_VITE_DEV_SERVER_URL ?? path.join(__dirname, "../renderer/index.html");

	constructor() {
		this.window = new Window(this.entry);

		// Initialize display handler with dependencies
		this.displayHandler = new DisplayHandler({
			refreshMonitors: () => this.window.refreshMonitors(),
			destroyShade: (id) => this.shades.destroy(id),
			destroyAllShades: () => this.shades.destroyAll(),
			applyBrightness: () => this.brightness.apply(null),
			readjustWindow: () => this.window.readjust()
		});

		this.setupTrayEvents();
		this.setupUpdaterEvents();
		this.setupShadeEvents();
		this.setupSchedulerEvents();
		this.setupIpcHandlers();

		// Setup window events using extracted handler
		setupWindowEvents({
			window: this.window,
			updater: this.updater,
			shades: this.shades
		});
	}

	private setupTrayEvents() {
		this.tray.on("click", () => {
			if (this.window.ref) {
				if (this.window.ref.isVisible()) {
					this.window.ref.blur();
				} else {
					this.window.ref.show();
				}
			} else {
				this.window.create();
			}
		});

		this.tray.on("check-for-updates", () => {
			this.updater.check(true);
		});
	}

	private setupUpdaterEvents() {
		this.updater.on("update-available", (release) => {
			this.window.disablePassThrough();
			this.window.ref.show();
			this.window.ref.webContents.send("update-available", release);
		});
	}

	private setupShadeEvents() {
		this.shades.on("blurred", (shade: BrowserWindow) => {
			if (!this.window.ref.webContents.isFocused()) shade.focus();
		});
	}

	private setupSchedulerEvents() {
		this.scheduler.on("ready", () => {
			this.brightness.apply(null);
			this.window.refreshMonitors();
		});

		ipcMain.handle("schedule-changed", this.scheduler.check);
	}

	private setupIpcHandlers() {
		setupIpcHandlers({ updater: this.updater });

		ipcMain.on("sync-appearance", this.handleAppearanceSync);
	}

	public init = async () => {
		installExtension(REACT_DEVELOPER_TOOLS);
		this.launch.start();
		this.scheduler.check();

		await this.window.create();
		await this.window.refreshMonitors();

		if (loadAutoUpdateCheck() || isDev) this.updater.check(true);

		// Initialize appearance handling
		this.appearanceHandler.setWindow(this.window.ref);
		this.appearanceHandler.setSyncEnabled(loadSyncAppearance());

		this.tray.create();
		this.brightness.apply(null);

		// Start display event handling
		this.displayHandler.start();

		session.defaultSession.webRequest.onHeadersReceived(this.handleHeaderReceived);
	};

	public restart = () => {
		this.window.create();
		this.window.ref.show();
	};

	private handleAppearanceSync = (_: IpcMainEvent, shouldSync: boolean) => {
		this.appearanceHandler.setSyncEnabled(shouldSync);
	};

	private handleHeaderReceived = (
		details: OnHeadersReceivedListenerDetails,
		callback: (headersReceivedResponse: HeadersReceivedResponse) => void
	) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				"Content-Security-Policy": ["connect-src 'self' * 'unsafe-eval'"]
			}
		});
	};
}

export default AppManager;

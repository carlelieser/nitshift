import Window from "../window";
import Auth from "../auth";
import Updater from "../updater";
import TrayManager from "./tray-manager";
import TrialManager from "./trial-manager";
import Shader from "../shader";
import BrightnessManager from "./brightness-manager";
import Scheduler from "../scheduler";
import { loadAutoUpdateCheck, loadLicense, loadMonitors, loadSyncAppearance, loadUserId } from "@main/storage";
import {
	BrowserWindow,
	HeadersReceivedResponse,
	ipcMain,
	IpcMainEvent,
	nativeTheme,
	OnHeadersReceivedListenerDetails,
	screen,
	session
} from "electron";
import process from "process";
import path from "path";
import { debounce } from "lodash";
import Defender from "../defender";
import LaunchManager from "./launch-manager";
import { isDev } from "@common/utils";
import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";

const MAIN_WINDOW_VITE_DEV_SERVER_URL = process.env["ELECTRON_RENDERER_URL"];
const REFRESH_DEBOUNCE = 3000;

class AppManager {
	public auth = new Auth();
	public updater = new Updater();
	public tray = new TrayManager();
	public trial = new TrialManager();
	public shades = new Shader();
	public brightness = new BrightnessManager(this.shades);
	public scheduler = new Scheduler();
	public defender = new Defender();
	public launch = new LaunchManager();
	private entry = MAIN_WINDOW_VITE_DEV_SERVER_URL ?? path.join(__dirname, "../renderer/index.html");
	public window: Window = new Window(this.entry);

	constructor() {
		this.auth.on("init", async () => {
			const user = loadUserId();
			const license = loadLicense();

			if (license === "trial") this.trial.start();
			if (user) await this.auth.storeUser();
			else await this.auth.createNewUser();
		});

		this.auth.on("user-stored", async (user) => {
			if (user.trialStartDate) {
				if (this.trial.check(user.trialStartDate)) {
					this.trial.start();
					await this.auth.updateUser();
				}
			}
			this.window.ref.webContents.send("sync-license");
		});

		this.tray.on("click", () => {
			if (this.window.ref) this.window.ref.show();
			else this.window.create();
		});

		this.tray.on("check-for-updates", () => {
			this.updater.check(true);
		});

		this.updater.on("update-available", (release) => {
			this.window.disablePassThrough();
			this.window.ref.show();
			this.window.ref.webContents.send("update-available", release);
		});

		this.trial.on("expired", (job) => {
			this.window.refreshMonitors();
			this.auth.updateUser().finally(() => {
				job.stop();
				this.window.ref.webContents.send("trial-ended");
			});
		});

		this.shades.on("blurred", (shade: BrowserWindow) => {
			if (!this.window.ref.webContents.isFocused()) shade.focus();
		});

		this.scheduler.on("ready", () => {
			this.brightness.apply(null);
			this.window.refreshMonitors();
		});

		ipcMain.handle("schedule-changed", this.scheduler.check);
		ipcMain.handle("free-trial-started", this.handleFreeTrialStarted);
		ipcMain.handle("update-user", this.auth.updateUser);
		ipcMain.handle("store-user", this.auth.storeUser);

		ipcMain.on("app/check-for-updates", this.updater.check.bind(this, true));
		ipcMain.on("sync-appearance", this.handleAppearanceSync);
		ipcMain.on("screen/size", this.handleGetScreenSize);

		this.window.on("window-created", (window: BrowserWindow) => {
			window.on("show", this.handleWindowShown);
			window.on("focus", this.handleWindowFocused);
			window.on("blur", this.handleWindowBlurred);
		});
	}

	public init = async () => {
		installExtension(REACT_DEVELOPER_TOOLS);
		this.launch.start();
		this.defender.init();
		await this.auth.init();

		this.scheduler.check();

		await this.window.create();
		await this.window.refreshMonitors();

		if (loadAutoUpdateCheck() || isDev) this.updater.check(true);

		this.initAppearanceSync(loadSyncAppearance());
		this.tray.create();
		this.brightness.apply(null);

		screen.on("display-metrics-changed", this.handleDisplayMetricsChanged);
		screen.on("display-added", this.handleDisplayAdded);
		screen.on("display-removed", this.handleDisplayRemoved);

		session.defaultSession.webRequest.onHeadersReceived(this.handleHeaderReceived);
	};

	public restart = () => {
		this.window.create();
		this.window.ref.show();
	};

	private handleGetScreenSize = (e: IpcMainEvent) => {
		const { size, scaleFactor } = screen.getPrimaryDisplay();
		const width = size.width * scaleFactor;
		const height = size.height * scaleFactor;
		e.returnValue = { width, height };
	};

	private refresh = async () => {
		await this.window.refreshMonitors();
		this.window.readjust();
	};

	private debounceRefresh = debounce(async () => {
		this.debounceRefresh.cancel();
		await this.refresh();
	}, REFRESH_DEBOUNCE);

	private smartApply = async () => {
		await this.refresh();
		this.brightness.apply(null);
	};

	private handleDisplayRemoved = debounce(async () => {
		const oldMonitors = loadMonitors().filter(({ connected }) => connected);
		const newMonitors = await this.window.refreshMonitors();
		const newlyConnectedMonitors = newMonitors.filter(({ connected }) => connected);
		const removedMonitors = oldMonitors.filter(
			(oldMonitor) => !newlyConnectedMonitors.find((monitor) => monitor.id === oldMonitor.id)
		);
		removedMonitors.forEach((monitor) => this.shades.destroy(monitor.id));
		await this.smartApply();
	}, 250);
	private handleDisplayMetricsChanged = debounce(async () => {
		this.shades.destroyAll();
		await this.smartApply();
	}, 250);

	private handleDisplayAdded = debounce(async () => {
		await this.smartApply();
	}, 250);

	private syncAppearanceWithNativeTheme = () => {
		const appearance = nativeTheme.shouldUseDarkColors ? "dark" : "light";
		this.window.ref.webContents.send("appearance-updated", appearance);
	};

	private handleAppearanceSync = (_: IpcMainEvent, shouldSync: boolean) => {
		this.initAppearanceSync(shouldSync);
	};

	private initAppearanceSync = (shouldSync: boolean) => {
		if (shouldSync) {
			this.syncAppearanceWithNativeTheme();
			nativeTheme.on("updated", this.syncAppearanceWithNativeTheme);
		} else {
			nativeTheme.off("updated", this.syncAppearanceWithNativeTheme);
		}
	};

	private handleFreeTrialStarted = async () => {
		await this.auth.updateUser();
		this.trial.start();
	};

	private handleWindowFocused = () => {
		this.window.ref.webContents.send("focused");
		this.updater.check();
		this.window.applyMode();
	};

	private handleWindowBlurred = () => {
		if (!this.window.autoHide || this.shades.anyFocused() || process.env.CAPTURE) return;
		if (!this.window.ref.isMinimized()) this.window.ref.webContents.send("blurred");
	};

	private handleWindowShown = () => {
		this.auth.storeUser();
		this.window.ref.webContents.send("focused");
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

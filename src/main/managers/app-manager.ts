import Window from "../window";
import Auth from "../auth";
import Updater from "../updater";
import TrayManager from "./tray-manager";
import TrialManager from "./trial-manager";
import Shader from "../shader";
import BrightnessManager from "./brightness-manager";
import Scheduler from "../scheduler";
import { loadAutoUpdateCheck, loadLicense, loadUserId } from "@main/storage";
import {
	BrowserWindow,
	HeadersReceivedResponse,
	ipcMain,
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

	private refresh = debounce(async () => {
		this.refresh.cancel();
		await this.window.refreshMonitors();
		this.window.readjust();
	}, REFRESH_DEBOUNCE);

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
			this.window.data.webContents.send("sync-license");
		});

		this.tray.on("click", () => {
			if (this.window.data) this.window.data.show();
			else this.window.create();
		});

		this.tray.on("check-for-updates", () => {
			this.updater.check(true);
		});

		this.updater.on("update-available", (release) => {
			this.window.disablePassThrough();
			this.window.data.show();
			this.window.data.webContents.send("update-available", release);
		});

		this.trial.on("expired", (job) => {
			this.window.refreshMonitors();
			this.auth.updateUser().finally(() => {
				job.stop();
				this.window.data.webContents.send("trial-ended");
			});
		});

		this.shades.on("blurred", (shade: BrowserWindow) => {
			if (!this.window.data.webContents.isFocused()) shade.focus();
		});

		this.scheduler.on("ready", () => {
			this.brightness.apply();
			this.window.refreshMonitors();
		});

		ipcMain.handle("schedule-changed", this.scheduler.check);
		ipcMain.handle("free-trial-started", this.handleFreeTrialStarted);
		ipcMain.handle("sync-user", this.auth.updateUser);

		this.window.on("window-created", (window: BrowserWindow) => {
			window.on("show", this.handleWindowShown);
			window.on("focus", this.handleWindowFocused);
			window.on("blur", this.handleWindowBlurred);
		});
	}

	public init = async () => {
		this.launch.start();
		this.defender.init();
		await this.auth.init();

		this.scheduler.check();

		await this.window.create();
		await this.window.refreshMonitors();

		if (loadAutoUpdateCheck() || isDev) this.updater.check(true);

		this.tray.create();
		this.brightness.apply();

		screen.on("display-metrics-changed", this.refresh);
		screen.on("display-added", this.refresh);
		screen.on("display-removed", this.refresh);

		session.defaultSession.webRequest.onHeadersReceived(this.handleHeaderReceived);
	};

	public restart = () => {
		this.window.create();
		this.window.data.show();
	};

	private handleFreeTrialStarted = async () => {
		await this.auth.updateUser();
		this.trial.start();
	};

	private handleWindowFocused = () => {
		this.window.data.webContents.send("focused");
		this.updater.check();
		this.window.applyMode();
	};

	private handleWindowBlurred = () => {
		if (!this.window.autoHide || this.shades.anyFocused() || process.env.CAPTURE) return;
		if (!this.window.data.isMinimized()) this.window.data.webContents.send("blurred");
	};

	private handleWindowShown = () => {
		this.auth.storeUser();
		this.window.data.webContents.send("focused");
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

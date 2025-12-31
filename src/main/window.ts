import { BrowserWindow, screen } from "electron";
import { loadMode } from "@main/storage";
import { dimensions, isDev } from "@common/utils";
import { UIMonitor } from "@common/types";
import fs from "fs-extra";
import path from "path";
import release from "@common/release.json";
import EventEmitter from "events";
import { loadAppearance, loadNative, loadStartupSettings, saveMode } from "./storage";
import { monitorService } from "./services/monitor-service";

class Window extends EventEmitter {
	public ref: BrowserWindow;
	public mode = loadMode();
	public autoHide = true;
	private readonly entry: any;

	private widthOffset = 0;
	private heightOffset = 0;

	constructor(entry: any) {
		super();
		this.entry = entry;

		this.on("ready-to-show", (window: BrowserWindow) => {
			if (loadStartupSettings().silent) {
				window.hide();
				window.blur();
				return;
			}
			window.show();
			window.focus();
			window.focusOnWebView();
		});
	}

	public resize = (width: number, height: number, animate: boolean = true) => {
		this.ref.setResizable(true);
		this.ref.setMaximumSize(width, height);
		this.ref.setSize(width, height, animate);
		this.ref.setResizable(false);
	};

	public readjust = () => {
		if (this.ref) {
			const width = this.getRealWidth();
			const height = this.getRealHeight();

			this.resize(width, height);

			const { x, y } = this.getCoordinates();
			this.ref.setPosition(x, y);
		}
	};

	public applyMode = () => {
		if (this.ref) {
			this.mode = loadMode();

			const width = this.getModeWidth();
			const height = this.getModeHeight();
			this.resize(width, height);
			this.readjust();
		}
	};

	public create = async () => {
		const coordinates = this.getCoordinates();
		if (this.ref) this.ref.destroy();
		this.ref = new BrowserWindow({
			focusable: true,
			transparent: true,
			show: false,
			resizable: false,
			maximizable: false,
			minimizable: false,
			skipTaskbar: true,
			fullscreenable: false,
			thickFrame: false,
			alwaysOnTop: true,
			frame: false,
			backgroundColor: "rgba(0,0,0,0)",
			movable: false,
			titleBarStyle: "hidden",
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
				nodeIntegrationInWorker: true,
				webSecurity: false,
				devTools: isDev
			},
			...coordinates
		});
		this.ref.setAlwaysOnTop(true, "pop-up-menu");

		this.ref.on("ready-to-show", () => {
			this.applyMode();
			this.emit("ready-to-show", this.ref);
		});

		this.emit("window-created", this.ref);

		saveMode(loadStartupSettings().mode);

		this.applyMode();

		if (this.entry.startsWith("http")) await this.ref.loadURL(this.entry);
		else await this.ref.loadFile(this.entry);

		this.emit("loaded");

		if (isDev) {
			setTimeout(() => {
				this.ref.webContents.openDevTools({
					mode: "detach"
				});
			}, 1000);
		}
	};

	public enablePassThrough = () => {
		if (this.ref) this.ref.setIgnoreMouseEvents(true, { forward: true });
	};

	public disablePassThrough = () => {
		if (this.ref) this.ref.setIgnoreMouseEvents(false);
	};

	public enableAutoHide = () => (this.autoHide = true);

	public disableAutoHide = () => (this.autoHide = false);

	public refreshMonitors = async (): Promise<UIMonitor[]> => {
		const monitors = await monitorService.refresh();

		if (this.ref) this.ref.webContents.send("refresh-monitors");

		return monitors;
	};

	public capture = async () => {
		const [width, height] = this.ref.getSize();
		const data = await this.ref.webContents.capturePage({
			width,
			height,
			x: 0,
			y: 0
		});
		const name = `${loadMode()}-${loadAppearance()}.png`;
		const output = path.resolve("screenshots", release.tag_name.split(".").join(""), name);
		return fs.outputFile(output, data.toPNG());
	};

	public setWidthOffset = (widthOffset: number) => {
		this.widthOffset = widthOffset;
		this.readjust();
	};

	public setHeightOffset = (heightOffset: number) => {
		this.heightOffset = heightOffset;
		this.readjust();
	};

	private getModeWidth = () => {
		return dimensions[this.mode][loadNative() ? "native" : "default"].width * (process.env.CAPTURE ? 2 : 1);
	};

	private getModeHeight = () => {
		return dimensions[this.mode][loadNative() ? "native" : "default"].height * (process.env.CAPTURE ? 2 : 1);
	};

	private getRealWidth = () => {
		return this.getModeWidth() + this.widthOffset;
	};

	private getRealHeight = () => {
		return this.getModeHeight() + this.heightOffset;
	};

	private getCoordinates = () => {
		const monitor = screen.getPrimaryDisplay();
		const right = monitor.workArea.x + monitor.workArea.width;
		const bottom = monitor.workArea.y + monitor.workArea.height;
		const width = this.getRealWidth();
		const height = this.getRealHeight();

		return {
			x: right - width - dimensions.padding,
			y: bottom - height - dimensions.padding
		};
	};

	public minimize = () => {
		this.setWidthOffset(0);
		this.setHeightOffset(0);
		if (this.ref) this.ref.minimize();
	};
}

export default Window;

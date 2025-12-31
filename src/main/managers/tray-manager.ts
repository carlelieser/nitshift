import iconPath from "@assets/img/icon-alt.png?asset";
import iconDarkPath from "@assets/img/icon-alt-dark.png?asset";
import { isDev } from "@common/utils";
import { app, clipboard, Menu, nativeImage, nativeTheme, Tray } from "electron";
import process from "process";
import release from "@common/release.json";
import { machineIdSync } from "node-machine-id";
import EventEmitter from "events";
import getUuidByString from "uuid-by-string";

class TrayManager extends EventEmitter {
	private tray: Tray;
	private icon: Electron.NativeImage;
	private menu: Electron.Menu;

	constructor() {
		super();
		nativeTheme.on("updated", this.updateTrayIcon);
	}

	public create = () => {
		this.updateIcon();
		this.updateTray();
		this.updateMenu();
		this.tray.setToolTip("Glimmr");
		this.tray.on("click", () => this.emit("click"));
	};

	private getMenuTemplate = (): (Electron.MenuItem | Electron.MenuItemConstructorOptions)[] => [
		{
			icon: this.icon.resize({ width: 16 }),
			label: "Glimmr",
			sublabel: `${release.tag_name} ${isDev ? "DEV" : ""}`,
			enabled: false
		},
		{
			type: "separator"
		},
		{
			label: "Copy Support ID",
			click: () => clipboard.writeText(machineIdSync())
		},
		{
			label: "Check for Updates...",
			click: () => this.emit("check-for-updates")
		},
		{
			type: "separator"
		},
		{
			label: "Quit Glimmr",
			click: () => {
				this.tray.destroy();
				app.quit();
				process.exit();
			}
		}
	];

	private updateTray = () => {
		this.tray = new Tray(this.icon, getUuidByString("glimmr"));
	};

	private updateMenu = () => {
		this.menu = Menu.buildFromTemplate(this.getMenuTemplate());
		this.tray.setContextMenu(this.menu);
	};

	private updateIcon = () => {
		this.icon = nativeImage
			.createFromPath(nativeTheme.shouldUseDarkColors ? iconPath : iconDarkPath)
			.resize({ width: 32 });
	};

	private updateTrayIcon = () => {
		this.updateIcon();
		this.tray.setImage(this.icon);
		this.updateMenu();
	};
}

export default TrayManager;

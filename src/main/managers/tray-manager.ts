import iconPath from "@assets/img/icon-alt.png?asset";
import { isDev } from "@common/utils";
import { app, clipboard, Menu, nativeImage, Tray } from "electron";
import process from "process";
import release from "@common/release.json";
import { machineIdSync } from "node-machine-id";
import EventEmitter from "events";

const nativeIcon = nativeImage.createFromPath(iconPath).resize({ width: 32 });

class TrayManager extends EventEmitter {
	private tray: Tray;

	public create = () => {
		this.tray = new Tray(nativeIcon);
		const devLabel = isDev ? "DEV" : "";
		const contextMenu = Menu.buildFromTemplate([
			{
				icon: nativeIcon.resize({ width: 16 }),
				label: "Glimmr",
				sublabel: `${release.tag_name} ${devLabel}`,
				enabled: false,
			},
			{
				type: "separator",
			},
			{
				label: "Copy Support ID",
				click: () => clipboard.writeText(machineIdSync()),
			},
			{
				label: "Check for Updates...",
				click: () => this.emit("check-for-updates"),
			},
			{
				type: "separator",
			},
			{
				label: "Quit Glimmr",
				click: () => {
					this.tray.destroy();
					app.quit();
					process.exit();
				},
			},
		]);
		this.tray.setToolTip("Glimmr");
		this.tray.setContextMenu(contextMenu);

		this.tray.on("click", () => this.emit("click"));
	};
}

export default TrayManager;

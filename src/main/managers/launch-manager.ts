import { app, ipcMain } from "electron";
import regedit from "regedit";
import path from "node:path";
import { exeRoot, isPackaged } from "../utils";
import { loadStartupSettings } from "../storage";

if (isPackaged) {
	const vbsDirectory = path.join(exeRoot, "resources", "vbs");
	regedit.setExternalVBSLocation(vbsDirectory);
}

interface LaunchItem {
	name: string;
	value: regedit.RegistryItemValue;
}

class LaunchManager {
	private hive = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";
	private path = `${this.hive}\\Glimmr`;

	constructor() {
		ipcMain.on("launch/update", (_event) => this.start());
	}

	public start = async () => {
		await this.removeExtraneousLaunchItems();
		if (loadStartupSettings().auto) await this.enable();
		else await this.disable();
	};

	private getLaunchItems = async () => {
		const keys = await regedit.promisified.list([this.hive]);
		const values = keys[this.hive].values;
		const items: Array<LaunchItem> = [];

		for (const name in values) {
			const item = values[name];
			if (item.type === "REG_SZ") {
				if (typeof item.value === "string") {
					if (item.value.toLowerCase().includes(app.getName().toLowerCase())) {
						items.push({
							name,
							value: item
						});
					}
				}
			}
		}

		return items;
	};

	private removeExtraneousLaunchItems = async () => {
		try {
			const items = await this.getLaunchItems();
			const filtered = items.filter((item) => item.name !== app.getName());
			const toRemove = filtered.map((item) => `${this.hive}\\${item.name}`);

			// @ts-ignore
			await regedit.promisified.deleteValue(toRemove);
		} catch (err) {
			console.log({
				message: "Error removing duplicate launch keys from registry.",
				err
			});
		}
	};

	private enable = async () => {
		try {
			await regedit.promisified.putValue({
				[this.hive]: {
					[app.getName()]: {
						type: "REG_SZ",
						value: app.getPath("exe")
					}
				}
			});
		} catch (err) {
			console.log({
				message: "Error enabling auto launch.",
				err
			});
		}
	};

	private disable = async () => {
		try {
			await this.removeExtraneousLaunchItems();
			// @ts-ignore
			await regedit.promisified.deleteValue(this.path);
		} catch (err) {
			console.log({
				message: "Error disabling auto launch.",
				err
			});
		}
	};
}

export default LaunchManager;

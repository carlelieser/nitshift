import path from "node:path";
import { app } from "electron";
import { machineIdSync } from "node-machine-id";
import { access, free_license, premium_license } from "./keys";
import { loadLicense } from "./storage";

export const isPackaged = path.dirname(app.getPath("exe")) === path.resolve(app.getAppPath(), "..", "..");

export const exeRoot = path.dirname(app.getPath("exe"));

export const getUserAccess = () => {
	const id = machineIdSync();
	if (access.includes("*")) return "all";
	return access.includes(id);
};

export const loadGenuineLicense = () => {
	const userAccess = getUserAccess();
	if (userAccess === "all") return loadLicense();
	if (userAccess) return premium_license;
	return free_license;
};

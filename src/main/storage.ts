import { AppState } from "@common/types";
import process from "process";
import fs from "fs";
import logSymbols from "log-symbols";
import { createDefaultBrightnessMode } from "../common/utils";
import Store from "electron-store";
import { decrypt, encrypt } from "./encyryption";

export const STORE = {
	ACTIVE_MONITOR: "active-monitor",
	GLOBAL_BRIGHTNESS: "global-brightness",
	BRIGHTNESS_MODES: "brightness-modes",
	LAST_UPDATED_ON: "last-updated-on",
	LICENSE: "license",
	APPEARANCE: "dark",
	MODE: "mode",
	MONITORS: "monitors",
	MONITOR_NICKNAMES: "monitor-nicknames",
	SCHEDULE: "schedule",
	TRIAL_AVAILABILITY: "trail-availability",
	TRIAL_START_DATE: "trial-start-date",
	USER_EMAIL: "user-email",
	USER_ID: "user-id",
	STARTUP: "startup",
};

export const storage = () =>
	new Store({
		name: "glimmr-store",
		clearInvalidConfig: true,
		serialize: (value: object) => encrypt(JSON.stringify(value, null, "\t")),
		deserialize: (value: string) => JSON.parse(decrypt(value)),
	});

const defaultBrightnessModes = [
	createDefaultBrightnessMode("Custom", "LightMode", 100, true),
	createDefaultBrightnessMode("Work", "Work", 80),
	createDefaultBrightnessMode("Reading", "Book", 65),
	createDefaultBrightnessMode("Gaming", "SportsEsports", 90),
	createDefaultBrightnessMode("Movie", "Movie", 80),
	createDefaultBrightnessMode("Night", "Bedtime", 30),
];

// [storage][start]
export const loadActiveMonitor = (): AppState["activeMonitor"] => storage().get(STORE.ACTIVE_MONITOR, null);
export const loadAppearance = (): AppState["appearance"] => storage().get(STORE.APPEARANCE, "dark");
export const loadBrightnessModes = (): AppState["brightnessModes"] =>
	storage().get(STORE.BRIGHTNESS_MODES, defaultBrightnessModes);
export const loadGlobalBrightness = (): AppState["brightness"] => storage().get(STORE.GLOBAL_BRIGHTNESS, 100);
export const loadLastUpdatedOn = (): number => storage().get(STORE.LAST_UPDATED_ON, null) as unknown as number;
export const loadLicense = (): AppState["license"] => storage().get(STORE.LICENSE, "free");
export const loadMode = (): AppState["mode"] => storage().get(STORE.MODE, "expanded");
export const loadMonitors = (): AppState["monitors"] => storage().get(STORE.MONITORS, []);
export const loadMonitorNicknames = (): AppState["monitorNicknames"] => storage().get(STORE.MONITOR_NICKNAMES, []);
export const loadSchedule = (): AppState["schedule"] => storage().get(STORE.SCHEDULE, []);
export const loadStartupSettings = (): AppState["startup"] =>
	storage().get(STORE.STARTUP, { mode: "compact", auto: true, silent: false });
export const loadTrialAvailability = (): AppState["trialAvailability"] =>
	storage().get(STORE.TRIAL_AVAILABILITY, false);
export const loadTrialStartDate = (): AppState["trialStartDate"] => storage().get(STORE.TRIAL_START_DATE, null);
export const loadUserEmail = (): AppState["userEmail"] => storage().get(STORE.USER_EMAIL, null);
export const loadUserId = (): AppState["userId"] => storage().get(STORE.USER_ID, null);
export const saveActiveMonitor = (monitor: AppState["activeMonitor"]) => storage().set(STORE.ACTIVE_MONITOR, monitor);
export const saveAppearance = (appearance: AppState["appearance"]) => storage().set(STORE.APPEARANCE, appearance);
export const saveBrightnessModes = (modes: AppState["brightnessModes"]) => storage().set(STORE.BRIGHTNESS_MODES, modes);
export const saveGlobalBrightness = (brightness: AppState["brightness"]) =>
	storage().set(STORE.GLOBAL_BRIGHTNESS, brightness);
export const saveLastUpdatedOn = (date: number) => storage().set(STORE.LAST_UPDATED_ON, date);
export const saveLicense = (license: AppState["license"]) => storage().set(STORE.LICENSE, license);
export const saveMode = (mode: AppState["mode"]) => storage().set(STORE.MODE, mode);
export const saveMonitors = (monitors: AppState["monitors"]) => storage().set(STORE.MONITORS, monitors);
export const saveMonitorNicknames = (monitors: AppState["monitorNicknames"]) =>
	storage().set(STORE.MONITOR_NICKNAMES, monitors);
export const saveSchedule = (schedule: AppState["schedule"]) => storage().set(STORE.SCHEDULE, schedule);
export const saveStartupSettings = (settings: AppState["startup"]) => storage().set(STORE.STARTUP, settings);
export const saveTrialAvailability = (available: AppState["trialAvailability"]) =>
	storage().set(STORE.TRIAL_AVAILABILITY, available);
export const saveTrialStartDate = (date: AppState["trialStartDate"]) => storage().set(STORE.TRIAL_START_DATE, date);
export const saveUserEmail = (email: AppState["userEmail"]) => storage().set(STORE.USER_EMAIL, email);
export const saveUserId = (id: AppState["userId"]) => storage().set(STORE.USER_ID, id);
// [storage][end]

if (process.argv.includes("--clear")) {
	const path = storage().path;
	fs.rmSync(path, { force: true });
	console.log(logSymbols.success, `storage file cleared: ${path}`);
}

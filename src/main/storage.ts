import { AppState } from "@common/types";
import process from "process";
import fs from "fs";
import logSymbols from "log-symbols";
import { createDefaultBrightnessMode } from "../common/utils";
import Store from "electron-store";
import { decrypt, encrypt } from "./encryption";

export const STORE = {
	AUTO_UPDATE_CHECK: "auto-update-check",
	ACTIVE_MONITOR: "active-monitor",
	GLOBAL_BRIGHTNESS: "global-brightness",
	BRIGHTNESS_MODES: "brightness-modes",
	LAST_UPDATED_ON: "last-updated-on",
	LICENSE: "license",
	APPEARANCE: "dark",
	SYNC_APPEARANCE: "sync-appearance",
	MODE: "mode",
	MONITORS: "monitors",
	MONITOR_NICKNAMES: "monitor-nicknames",
	NATIVE: "native",
	SCHEDULE: "schedule",
	TRIAL_AVAILABILITY: "trail-availability",
	TRIAL_START_DATE: "trial-start-date",
	USER_EMAIL: "user-email",
	USER_ID: "user-id",
	STARTUP: "startup",
	MIN_SHADE_LEVEL: "min-shade-level",
	MAX_SHADE_LEVEL: "max-shade-level",
	AUTO_RESIZE: "auto-resize"
};

export const storage = () =>
	new Store({
		name: "glimmr-store",
		clearInvalidConfig: true,
		serialize: (value: object) => encrypt(JSON.stringify(value, null, "\t")),
		deserialize: (value: string) => JSON.parse(decrypt(value))
	});

const defaultBrightnessModes = [
	createDefaultBrightnessMode("Custom", "LightMode", 100, true),
	createDefaultBrightnessMode("Work", "Work", 80),
	createDefaultBrightnessMode("Reading", "Book", 65),
	createDefaultBrightnessMode("Gaming", "SportsEsports", 90),
	createDefaultBrightnessMode("Movie", "Movie", 80),
	createDefaultBrightnessMode("Night", "Bedtime", 30)
];

// [storage][start]
export const loadActiveMonitor = (): AppState["activeMonitor"] => storage().get(STORE.ACTIVE_MONITOR, null);
export const loadAppearance = (): AppState["appearance"] => storage().get(STORE.APPEARANCE, "dark");
export const loadAutoResize = (): AppState["autoResize"] => storage().get(STORE.AUTO_RESIZE, true);
export const loadSyncAppearance = (): AppState["syncAppearance"] => storage().get(STORE.SYNC_APPEARANCE, true);
export const loadAutoUpdateCheck = (): AppState["autoUpdateCheck"] => storage().get(STORE.AUTO_UPDATE_CHECK, true);
export const loadBrightnessModes = (): AppState["brightnessModes"] =>
	storage().get(STORE.BRIGHTNESS_MODES, defaultBrightnessModes);
export const loadGlobalBrightness = (): AppState["brightness"] => storage().get(STORE.GLOBAL_BRIGHTNESS, 100);
export const loadLastUpdatedOn = (): number => storage().get(STORE.LAST_UPDATED_ON, null) as unknown as number;
export const loadLicense = (): AppState["license"] => storage().get(STORE.LICENSE, "free");
export const loadMode = (): AppState["mode"] => storage().get(STORE.MODE, "expanded");
export const loadMonitors = (): AppState["monitors"] => storage().get(STORE.MONITORS, []);
export const loadMonitorNicknames = (): AppState["monitorNicknames"] => storage().get(STORE.MONITOR_NICKNAMES, []);
export const loadNative = (): AppState["native"] => storage().get(STORE.NATIVE, false);
export const loadSchedule = (): AppState["schedule"] => storage().get(STORE.SCHEDULE, []);
export const loadStartupSettings = (): AppState["startup"] =>
	storage().get(STORE.STARTUP, { mode: "compact", auto: true, silent: false });
export const loadTrialAvailability = (): AppState["trialAvailability"] =>
	storage().get(STORE.TRIAL_AVAILABILITY, false);
export const loadTrialStartDate = (): AppState["trialStartDate"] => storage().get(STORE.TRIAL_START_DATE, null);
export const loadUserEmail = (): AppState["userEmail"] => storage().get(STORE.USER_EMAIL, null);
export const loadUserId = (): AppState["userId"] => storage().get(STORE.USER_ID, null);
export const loadMinShadeLevel = (): AppState["minShadeLevel"] => storage().get(STORE.MIN_SHADE_LEVEL, 10);
export const loadMaxShadeLevel = (): AppState["maxShadeLevel"] => storage().get(STORE.MAX_SHADE_LEVEL, 100);
export const saveActiveMonitor = (monitor: AppState["activeMonitor"]) => storage().set(STORE.ACTIVE_MONITOR, monitor);
export const saveAppearance = (appearance: AppState["appearance"]) => storage().set(STORE.APPEARANCE, appearance);
export const saveAutoResize = (autoResize: AppState["autoResize"]) => storage().set(STORE.AUTO_RESIZE, autoResize);
export const saveSyncAppearance = (shouldSync: AppState["syncAppearance"]) =>
	storage().set(STORE.SYNC_APPEARANCE, shouldSync);
export const saveAutoUpdateCheck = (autoUpdateCheck: boolean) =>
	storage().set(STORE.AUTO_UPDATE_CHECK, autoUpdateCheck);
export const saveBrightnessModes = (modes: AppState["brightnessModes"]) => storage().set(STORE.BRIGHTNESS_MODES, modes);
export const saveGlobalBrightness = (brightness: AppState["brightness"]) =>
	storage().set(STORE.GLOBAL_BRIGHTNESS, brightness);
export const saveLastUpdatedOn = (date: number) => storage().set(STORE.LAST_UPDATED_ON, date);
export const saveLicense = (license: AppState["license"]) => storage().set(STORE.LICENSE, license);
export const saveMode = (mode: AppState["mode"]) => storage().set(STORE.MODE, mode);
export const saveMonitors = (monitors: AppState["monitors"]) => storage().set(STORE.MONITORS, monitors);
export const saveMonitorNicknames = (monitors: AppState["monitorNicknames"]) =>
	storage().set(STORE.MONITOR_NICKNAMES, monitors);
export const saveNative = (isNative: boolean) => storage().set(STORE.NATIVE, isNative);
export const saveSchedule = (schedule: AppState["schedule"]) => storage().set(STORE.SCHEDULE, schedule);
export const saveStartupSettings = (settings: AppState["startup"]) => storage().set(STORE.STARTUP, settings);
export const saveTrialAvailability = (available: AppState["trialAvailability"]) =>
	storage().set(STORE.TRIAL_AVAILABILITY, available);
export const saveTrialStartDate = (date: AppState["trialStartDate"]) => storage().set(STORE.TRIAL_START_DATE, date);
export const saveUserEmail = (email: AppState["userEmail"]) => storage().set(STORE.USER_EMAIL, email);
export const saveUserId = (id: AppState["userId"]) => storage().set(STORE.USER_ID, id);
export const saveMinShadeLevel = (level: AppState["minShadeLevel"]) => storage().set(STORE.MIN_SHADE_LEVEL, level);
export const saveMaxShadeLevel = (level: AppState["maxShadeLevel"]) => storage().set(STORE.MAX_SHADE_LEVEL, level);
// [storage][end]

if (process.argv.includes("--clear")) {
	const path = storage().path;
	fs.rmSync(path, { force: true });
	console.log(logSymbols.success, `storage file cleared: ${path}`);
}

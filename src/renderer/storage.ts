// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import { ipcRenderer } from "electron";
import { AppState } from "@common/types";

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
	STARTUP: "startup"
};

export const remove = (id) => ipcRenderer.sendSync("storage/remove", id);

export const loadActiveMonitor = (): AppState["activeMonitor"] => ipcRenderer.sendSync("storage/load-active-monitor");
export const loadAppearance = (): AppState["appearance"] => ipcRenderer.sendSync("storage/load-appearance");
export const loadAutoUpdateCheck = (): AppState["autoUpdateCheck"] =>
	ipcRenderer.sendSync("storage/load-auto-update-check");
export const loadBrightnessModes = (): AppState["brightnessModes"] =>
	ipcRenderer.sendSync("storage/load-brightness-modes");
export const loadGlobalBrightness = (): AppState["brightness"] =>
	ipcRenderer.sendSync("storage/load-global-brightness");
export const loadLastUpdatedOn = (): number => ipcRenderer.sendSync("storage/load-last-updated-on");
export const loadLicense = (): AppState["license"] => ipcRenderer.sendSync("storage/load-license");
export const loadMode = (): AppState["mode"] => ipcRenderer.sendSync("storage/load-mode");
export const loadMonitors = (): AppState["monitors"] => ipcRenderer.sendSync("storage/load-monitors");
export const loadMonitorNicknames = (): AppState["monitorNicknames"] =>
	ipcRenderer.sendSync("storage/load-monitor-nicknames");
export const loadSchedule = (): AppState["schedule"] => ipcRenderer.sendSync("storage/load-schedule");
export const loadStartupSettings = (): AppState["startup"] => ipcRenderer.sendSync("storage/load-startup-settings");
export const loadTrialAvailability = (): AppState["trialAvailability"] =>
	ipcRenderer.sendSync("storage/load-trial-availability");
export const loadTrialStartDate = (): AppState["trialStartDate"] =>
	ipcRenderer.sendSync("storage/load-trial-start-date");
export const loadUserEmail = (): AppState["userEmail"] => ipcRenderer.sendSync("storage/load-user-email");
export const loadUserId = (): AppState["userId"] => ipcRenderer.sendSync("storage/load-user-id");
export const saveActiveMonitor = (monitor: AppState["activeMonitor"]) =>
	ipcRenderer.sendSync("storage/save-active-monitor", monitor);
export const saveAppearance = (appearance: AppState["appearance"]) =>
	ipcRenderer.sendSync("storage/save-appearance", appearance);
export const saveAutoUpdateCheck = (autoUpdateCheck: boolean) =>
	ipcRenderer.sendSync("storage/save-auto-update-check", autoUpdateCheck);
export const saveBrightnessModes = (modes: AppState["brightnessModes"]) =>
	ipcRenderer.sendSync("storage/save-brightness-modes", modes);
export const saveGlobalBrightness = (brightness: AppState["brightness"]) =>
	ipcRenderer.sendSync("storage/save-global-brightness", brightness);
export const saveLastUpdatedOn = (date: number) => ipcRenderer.sendSync("storage/save-last-updated-on", date);
export const saveLicense = (license: AppState["license"]) => ipcRenderer.sendSync("storage/save-license", license);
export const saveMode = (mode: AppState["mode"]) => ipcRenderer.sendSync("storage/save-mode", mode);
export const saveMonitors = (monitors: AppState["monitors"]) => ipcRenderer.sendSync("storage/save-monitors", monitors);
export const saveMonitorNicknames = (monitors: AppState["monitorNicknames"]) =>
	ipcRenderer.sendSync("storage/save-monitor-nicknames", monitors);
export const saveSchedule = (schedule: AppState["schedule"]) => ipcRenderer.sendSync("storage/save-schedule", schedule);
export const saveStartupSettings = (settings: AppState["startup"]) =>
	ipcRenderer.sendSync("storage/save-startup-settings", settings);
export const saveTrialAvailability = (available: AppState["trialAvailability"]) =>
	ipcRenderer.sendSync("storage/save-trial-availability", available);
export const saveTrialStartDate = (date: AppState["trialStartDate"]) =>
	ipcRenderer.sendSync("storage/save-trial-start-date", date);
export const saveUserEmail = (email: AppState["userEmail"]) => ipcRenderer.sendSync("storage/save-user-email", email);
export const saveUserId = (id: AppState["userId"]) => ipcRenderer.sendSync("storage/save-user-id", id);

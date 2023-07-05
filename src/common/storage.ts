import { AppState } from "../renderer/reducers/app";
import * as process from "process";
import fs from "fs";
import logSymbols from "log-symbols";

const crypto = require("crypto");
const encryption = require("./encryption.json");
const algorithm = "aes-256-cbc";

const encrypt = (text: string) => {
	const iv = Buffer.from(crypto.randomBytes(16));
	let cipher = crypto.createCipheriv(algorithm, Buffer.from(encryption.id, "hex"), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString("hex") + encrypted.toString("hex");
};

const decrypt = (text: string) => {
	let iv = Buffer.from(text.substring(0, 32), "hex");
	let encryptedText = Buffer.from(text.substring(32, text.length), "hex");
	let decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryption.id, "hex"), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
};

const Store = require("electron-store");

export const STORE = {
	ACTIVE_MONITOR: "active-monitor",
	GLOBAL_BRIGHTNESS: "global-brightness",
	LAST_UPDATED_ON: "last-updated-on",
	LICENSE: "license",
	MODE: "mode",
	MONITORS: "monitors",
	MONITOR_NICKNAMES: "monitor-nicknames",
	SCHEDULE: "schedule",
	TRIAL_AVAILABILITY: "trail-availability",
	TRIAL_START_DATE: "trial-start-date",
	USER_EMAIL: "user-email",
	USER_ID: "user-id",
};

export const storage = () =>
	new Store({
		name: "glimmr-store",
		clearInvalidConfig: true,
		serialize: (value: object) => encrypt(JSON.stringify(value, null, "\t")),
		deserialize: (value: string) => JSON.parse(decrypt(value)),
	});

export const loadActiveMonitor = (): AppState["activeMonitor"] => storage().get(STORE.ACTIVE_MONITOR, null);
export const loadGlobalBrightness = (): AppState["brightness"] => storage().get(STORE.GLOBAL_BRIGHTNESS, 100);
export const loadLastUpdatedOn = (): number => storage().get(STORE.LAST_UPDATED_ON, null);
export const loadLicense = (): AppState["license"] => storage().get(STORE.LICENSE, "free");
export const loadMode = (): AppState["mode"] => storage().get(STORE.MODE, "expanded");
export const loadMonitors = (): AppState["monitors"] => storage().get(STORE.MONITORS, []);
export const loadMonitorNicknames = (): AppState["monitorNicknames"] => storage().get(STORE.MONITOR_NICKNAMES, []);
export const loadSchedule = (): AppState["schedule"] => storage().get(STORE.SCHEDULE, []);
export const loadTrialAvailability = (): AppState["trialAvailability"] => storage().get(STORE.TRIAL_AVAILABILITY, false);
export const loadTrialStartDate = (): AppState["trialStartDate"] => storage().get(STORE.TRIAL_START_DATE, null);
export const loadUserEmail = (): AppState["userEmail"] => storage().get(STORE.USER_EMAIL, null);
export const loadUserId = (): AppState["userId"] => storage().get(STORE.USER_ID, null);
export const saveActiveMonitor = (monitor: AppState["activeMonitor"]) => storage().set(STORE.ACTIVE_MONITOR, monitor);
export const saveGlobalBrightness = (brightness: AppState["brightness"]) => storage().set(STORE.GLOBAL_BRIGHTNESS, brightness);
export const saveLastUpdatedOn = (date: number) => storage().set(STORE.LAST_UPDATED_ON, date);
export const saveLicense = (license: AppState["license"]) => storage().set(STORE.LICENSE, license);
export const saveMode = (mode: AppState["mode"]) => storage().set(STORE.MODE, mode);
export const saveMonitors = (monitors: AppState["monitors"]) => storage().set(STORE.MONITORS, monitors);
export const saveMonitorNicknames = (monitors: AppState["monitorNicknames"]) => storage().set(STORE.MONITOR_NICKNAMES, monitors);
export const saveSchedule = (schedule: AppState["schedule"]) => storage().set(STORE.SCHEDULE, schedule);
export const saveTrialAvailability = (available: AppState["trialAvailability"]) => storage().set(STORE.TRIAL_AVAILABILITY, available);
export const saveTrialStartDate = (date: AppState["trialStartDate"]) => storage().set(STORE.TRIAL_START_DATE, date);
export const saveUserEmail = (email: AppState["userEmail"]) => storage().set(STORE.USER_EMAIL, email);
export const saveUserId = (id: AppState["userId"]) => storage().set(STORE.USER_ID, id);

if (process.argv.includes("--clear")) {
	const path = storage().path;
	fs.rmSync(path, { force: true });
	console.log(logSymbols.success, `storage file cleared: ${path}`);
}

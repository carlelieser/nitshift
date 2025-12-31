import { AppState } from "./types";
import { getDefaultBrightnessModes } from "./utils";

// Storage keys - shared between main and renderer
export const STORE_KEYS = {
	AUTO_UPDATE_CHECK: "auto-update-check",
	ACTIVE_MONITOR: "active-monitor",
	GLOBAL_BRIGHTNESS: "global-brightness",
	BRIGHTNESS_MODES: "brightness-modes",
	LAST_UPDATED_ON: "last-updated-on",
	APPEARANCE: "dark",
	SYNC_APPEARANCE: "sync-appearance",
	MODE: "mode",
	MONITORS: "monitors",
	MONITOR_NICKNAMES: "monitor-nicknames",
	NATIVE: "native",
	SCHEDULE: "schedule",
	STARTUP: "startup",
	MIN_SHADE_LEVEL: "min-shade-level",
	MAX_SHADE_LEVEL: "max-shade-level",
	AUTO_RESIZE: "auto-resize"
} as const;

// Default values for each storage key
export const STORE_DEFAULTS = {
	[STORE_KEYS.AUTO_UPDATE_CHECK]: true,
	[STORE_KEYS.ACTIVE_MONITOR]: null,
	[STORE_KEYS.GLOBAL_BRIGHTNESS]: 100,
	[STORE_KEYS.BRIGHTNESS_MODES]: () => getDefaultBrightnessModes(),
	[STORE_KEYS.LAST_UPDATED_ON]: null,
	[STORE_KEYS.APPEARANCE]: "dark",
	[STORE_KEYS.SYNC_APPEARANCE]: true,
	[STORE_KEYS.MODE]: "expanded",
	[STORE_KEYS.MONITORS]: [],
	[STORE_KEYS.MONITOR_NICKNAMES]: [],
	[STORE_KEYS.NATIVE]: false,
	[STORE_KEYS.SCHEDULE]: [],
	[STORE_KEYS.STARTUP]: { mode: "compact", auto: true, silent: false },
	[STORE_KEYS.MIN_SHADE_LEVEL]: 10,
	[STORE_KEYS.MAX_SHADE_LEVEL]: 100,
	[STORE_KEYS.AUTO_RESIZE]: true
} as const;

// Store configuration
export const STORE_CONFIG = {
	name: "glimmr-store-v2",
	clearInvalidConfig: true
} as const;

// Generic store interface that both electron-store instances implement
export interface StoreInterface {
	get<T>(key: string, defaultValue?: T): T;
	set(key: string, value: unknown): void;
	delete(key: string): void;
}

// Factory function to create storage accessors from a store instance
export function createStorageAccessors(getStore: () => StoreInterface) {
	const getDefault = <T>(key: keyof typeof STORE_DEFAULTS): T => {
		const defaultValue = STORE_DEFAULTS[key];
		return (typeof defaultValue === "function" ? defaultValue() : defaultValue) as T;
	};

	return {
		// Remove
		remove: (key: string) => getStore().delete(key),

		// Load functions
		loadActiveMonitor: (): AppState["activeMonitor"] =>
			getStore().get(STORE_KEYS.ACTIVE_MONITOR, getDefault(STORE_KEYS.ACTIVE_MONITOR)),
		loadAppearance: (): AppState["appearance"] =>
			getStore().get(STORE_KEYS.APPEARANCE, getDefault(STORE_KEYS.APPEARANCE)),
		loadAutoResize: (): AppState["autoResize"] =>
			getStore().get(STORE_KEYS.AUTO_RESIZE, getDefault(STORE_KEYS.AUTO_RESIZE)),
		loadSyncAppearance: (): AppState["syncAppearance"] =>
			getStore().get(STORE_KEYS.SYNC_APPEARANCE, getDefault(STORE_KEYS.SYNC_APPEARANCE)),
		loadAutoUpdateCheck: (): AppState["autoUpdateCheck"] =>
			getStore().get(STORE_KEYS.AUTO_UPDATE_CHECK, getDefault(STORE_KEYS.AUTO_UPDATE_CHECK)),
		loadBrightnessModes: (): AppState["brightnessModes"] =>
			getStore().get(STORE_KEYS.BRIGHTNESS_MODES, getDefault(STORE_KEYS.BRIGHTNESS_MODES)),
		loadGlobalBrightness: (): AppState["brightness"] =>
			getStore().get(STORE_KEYS.GLOBAL_BRIGHTNESS, getDefault(STORE_KEYS.GLOBAL_BRIGHTNESS)),
		loadLastUpdatedOn: (): number =>
			getStore().get(STORE_KEYS.LAST_UPDATED_ON, getDefault(STORE_KEYS.LAST_UPDATED_ON)),
		loadMode: (): AppState["mode"] =>
			getStore().get(STORE_KEYS.MODE, getDefault(STORE_KEYS.MODE)),
		loadMonitors: (): AppState["monitors"] =>
			getStore().get(STORE_KEYS.MONITORS, getDefault(STORE_KEYS.MONITORS)),
		loadMonitorNicknames: (): AppState["monitorNicknames"] =>
			getStore().get(STORE_KEYS.MONITOR_NICKNAMES, getDefault(STORE_KEYS.MONITOR_NICKNAMES)),
		loadNative: (): AppState["native"] =>
			getStore().get(STORE_KEYS.NATIVE, getDefault(STORE_KEYS.NATIVE)),
		loadSchedule: (): AppState["schedule"] =>
			getStore().get(STORE_KEYS.SCHEDULE, getDefault(STORE_KEYS.SCHEDULE)),
		loadStartupSettings: (): AppState["startup"] =>
			getStore().get(STORE_KEYS.STARTUP, getDefault(STORE_KEYS.STARTUP)),
		loadMinShadeLevel: (): AppState["minShadeLevel"] =>
			getStore().get(STORE_KEYS.MIN_SHADE_LEVEL, getDefault(STORE_KEYS.MIN_SHADE_LEVEL)),
		loadMaxShadeLevel: (): AppState["maxShadeLevel"] =>
			getStore().get(STORE_KEYS.MAX_SHADE_LEVEL, getDefault(STORE_KEYS.MAX_SHADE_LEVEL)),

		// Save functions
		saveActiveMonitor: (monitor: AppState["activeMonitor"]) =>
			getStore().set(STORE_KEYS.ACTIVE_MONITOR, monitor),
		saveAppearance: (appearance: AppState["appearance"]) =>
			getStore().set(STORE_KEYS.APPEARANCE, appearance),
		saveAutoResize: (autoResize: AppState["autoResize"]) =>
			getStore().set(STORE_KEYS.AUTO_RESIZE, autoResize),
		saveSyncAppearance: (shouldSync: AppState["syncAppearance"]) =>
			getStore().set(STORE_KEYS.SYNC_APPEARANCE, shouldSync),
		saveAutoUpdateCheck: (autoUpdateCheck: boolean) =>
			getStore().set(STORE_KEYS.AUTO_UPDATE_CHECK, autoUpdateCheck),
		saveBrightnessModes: (modes: AppState["brightnessModes"]) =>
			getStore().set(STORE_KEYS.BRIGHTNESS_MODES, modes),
		saveGlobalBrightness: (brightness: AppState["brightness"]) =>
			getStore().set(STORE_KEYS.GLOBAL_BRIGHTNESS, brightness),
		saveLastUpdatedOn: (date: number) =>
			getStore().set(STORE_KEYS.LAST_UPDATED_ON, date),
		saveMode: (mode: AppState["mode"]) =>
			getStore().set(STORE_KEYS.MODE, mode),
		saveMonitors: (monitors: AppState["monitors"]) =>
			getStore().set(STORE_KEYS.MONITORS, monitors),
		saveMonitorNicknames: (monitors: AppState["monitorNicknames"]) =>
			getStore().set(STORE_KEYS.MONITOR_NICKNAMES, monitors),
		saveNative: (isNative: boolean) =>
			getStore().set(STORE_KEYS.NATIVE, isNative),
		saveSchedule: (schedule: AppState["schedule"]) =>
			getStore().set(STORE_KEYS.SCHEDULE, schedule),
		saveStartupSettings: (settings: AppState["startup"]) =>
			getStore().set(STORE_KEYS.STARTUP, settings),
		saveMinShadeLevel: (level: AppState["minShadeLevel"]) =>
			getStore().set(STORE_KEYS.MIN_SHADE_LEVEL, level),
		saveMaxShadeLevel: (level: AppState["maxShadeLevel"]) =>
			getStore().set(STORE_KEYS.MAX_SHADE_LEVEL, level)
	};
}

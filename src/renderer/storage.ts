import Store from "electron-store";
import { createStorageAccessors, STORE_CONFIG, STORE_KEYS } from "@common/storage";

const store = new Store(STORE_CONFIG);

// Re-export STORE_KEYS as STORE for backwards compatibility
export const STORE = STORE_KEYS;

// Create all storage accessors using the shared factory
const accessors = createStorageAccessors(() => store);

// Export all accessors
export const {
	remove,
	loadActiveMonitor,
	loadAppearance,
	loadAutoResize,
	loadSyncAppearance,
	loadAutoUpdateCheck,
	loadBrightnessModes,
	loadGlobalBrightness,
	loadLastUpdatedOn,
	loadMode,
	loadMonitors,
	loadMonitorNicknames,
	loadNative,
	loadSchedule,
	loadStartupSettings,
	loadMinShadeLevel,
	loadMaxShadeLevel,
	saveActiveMonitor,
	saveAppearance,
	saveAutoResize,
	saveSyncAppearance,
	saveAutoUpdateCheck,
	saveBrightnessModes,
	saveGlobalBrightness,
	saveLastUpdatedOn,
	saveMode,
	saveMonitors,
	saveMonitorNicknames,
	saveNative,
	saveSchedule,
	saveStartupSettings,
	saveMinShadeLevel,
	saveMaxShadeLevel
} = accessors;

import process from "process";
import fs from "fs";
import logSymbols from "log-symbols";
import Store from "electron-store";
import { createStorageAccessors, STORE_CONFIG, STORE_KEYS } from "../common/storage";

// Re-export STORE_KEYS as STORE for backwards compatibility
export const STORE = STORE_KEYS;

// Factory function for creating store instances (main process pattern)
export const storage = () => new Store(STORE_CONFIG);

// Create all storage accessors using the shared factory
const accessors = createStorageAccessors(storage);

// Export all accessors
export const {
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

// CLI flag to clear storage
if (process.argv.includes("--clear")) {
	const path = storage().path;
	fs.rmSync(path, { force: true });
	console.log(logSymbols.success, `storage file cleared: ${path}`);
}

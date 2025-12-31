import { createSlice } from "@reduxjs/toolkit";
import {
	loadActiveMonitor,
	loadAppearance,
	loadAutoResize,
	loadAutoUpdateCheck,
	loadBrightnessModes,
	loadGlobalBrightness,
	loadMaxShadeLevel,
	loadMinShadeLevel,
	loadMode,
	loadMonitorNicknames,
	loadMonitors,
	loadNative,
	loadSchedule,
	loadStartupSettings,
	loadSyncAppearance
} from "@renderer/storage";
import { AppState } from "@common/types";
import { combinedReducers } from "./slices";

// Re-export types from slices for backwards compatibility
export type {
	SetMonitorBrightnessAction,
	SetMonitorDisabledAction,
	SetMonitorModeAction,
	SetMonitorNameAction
} from "./slices/monitors";

export { findMonitorIndexById } from "./slices/monitors";

// Initial state
const initialState: AppState = {
	// Monitor state
	activeMonitor: loadActiveMonitor(),
	monitors: loadMonitors(),
	monitorNicknames: loadMonitorNicknames(),

	// Brightness state
	brightness: loadGlobalBrightness(),
	brightnessModes: loadBrightnessModes(),
	native: loadNative(),
	minShadeLevel: loadMinShadeLevel(),
	maxShadeLevel: loadMaxShadeLevel(),

	// Schedule state
	schedule: loadSchedule(),

	// UI state
	mode: loadMode(),
	prevMode: loadMode(),
	transitioning: false,
	focused: false,
	refreshed: false,
	release: null,
	settingsDialogOpen: false,

	// Settings state
	appearance: loadAppearance(),
	syncAppearance: loadSyncAppearance(),
	autoUpdateCheck: loadAutoUpdateCheck(),
	autoResize: loadAutoResize(),
	startup: loadStartupSettings()
};

// Create slice with combined reducers from domain files
export const appSlice = createSlice({
	name: "app",
	initialState,
	reducers: combinedReducers
});

// Export actions
export const {
	// Monitor actions
	refreshAvailableMonitors,
	setActiveMonitor,
	setMonitors,
	setMonitorBrightness,
	setMonitorDisabled,
	setMonitorMode,
	setMonitorName,

	// Brightness actions
	addBrightnessMode,
	editBrightnessMode,
	removeBrightnessMode,
	setActiveBrightnessMode,
	setBrightness,
	setBrightnessSilent,
	setBrightnessModes,
	setNative,
	setMinShadeLevel,
	setMaxShadeLevel,

	// Schedule actions
	addSchedule,
	editSchedule,
	removeSchedule,
	setSchedule,

	// UI actions
	setMode,
	setPrevMode,
	setTransitioning,
	setFocused,
	setRefreshed,
	setRelease,
	setSettingsDialogOpen,

	// Settings actions
	setAppearance,
	setSyncAppearance,
	setAutoUpdateCheck,
	setAutoResize,
	setStartupSettings
} = appSlice.actions;

export default appSlice.reducer;

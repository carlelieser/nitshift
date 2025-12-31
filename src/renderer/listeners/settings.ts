import { ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { ipcRenderer } from "electron";
import { AppState } from "@common/types";
import {
	setAppearance,
	setAutoUpdateCheck,
	setMode,
	setStartupSettings,
	setSyncAppearance
} from "@reducers/app";
import {
	saveAppearance,
	saveAutoUpdateCheck,
	saveMode,
	saveStartupSettings,
	saveSyncAppearance
} from "@renderer/storage";

export function setupSettingsListeners(listener: ListenerMiddlewareInstance<{ app: AppState }>) {
	// App mode change (compact/expanded)
	listener.startListening({
		actionCreator: setMode,
		effect: (action) => {
			saveMode(action.payload);
			ipcRenderer.invoke("app/mode-changed", action.payload);
		}
	});

	// Appearance change
	listener.startListening({
		actionCreator: setAppearance,
		effect: (action) => {
			saveAppearance(action.payload);
		}
	});

	// Sync appearance with system
	listener.startListening({
		actionCreator: setSyncAppearance,
		effect: (action) => {
			saveSyncAppearance(action.payload);
			ipcRenderer.send("sync-appearance", action.payload);
		}
	});

	// Auto update check setting
	listener.startListening({
		actionCreator: setAutoUpdateCheck,
		effect: (action) => {
			saveAutoUpdateCheck(action.payload);
		}
	});

	// Startup settings
	listener.startListening({
		actionCreator: setStartupSettings,
		effect: (_action, api) => {
			const state = api.getState();
			saveStartupSettings(state.app.startup);
			ipcRenderer.send("launch/update");
		}
	});
}

import { isAnyOf, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { ipcRenderer } from "electron";
import { batch } from "react-redux";
import { AppState } from "@common/types";
import {
	addBrightnessMode,
	editBrightnessMode,
	removeBrightnessMode,
	setActiveBrightnessMode,
	setActiveMonitor,
	setBrightness,
	setBrightnessSilent,
	setMaxShadeLevel,
	setMinShadeLevel,
	setNative
} from "@reducers/app";
import {
	saveBrightnessModes,
	saveGlobalBrightness,
	saveMaxShadeLevel,
	saveMinShadeLevel,
	saveNative
} from "@renderer/storage";

export function setupBrightnessListeners(listener: ListenerMiddlewareInstance<{ app: AppState }>) {
	// Global brightness change
	listener.startListening({
		actionCreator: setBrightness,
		effect: (action, api) => {
			const state = api.getState();
			const activeMode = state.app.brightnessModes.find(({ active }) => active);
			const customMode = state.app.brightnessModes.find(({ label }) => label === "Custom");

			batch(() => {
				if (activeMode.id === customMode.id) {
					api.dispatch(editBrightnessMode({ ...customMode, brightness: action.payload }));
				} else {
					api.dispatch(
						setActiveBrightnessMode({
							id: customMode.id,
							disableBrightness: true
						})
					);
				}

				if (state.app.activeMonitor !== null) api.dispatch(setActiveMonitor(null));
			});

			saveGlobalBrightness(action.payload);
			ipcRenderer.invoke("monitors/brightness/global/changed");
		}
	});

	// Silent brightness change (no mode switch)
	listener.startListening({
		actionCreator: setBrightnessSilent,
		effect: (action) => {
			saveGlobalBrightness(action.payload);
			ipcRenderer.invoke("monitors/brightness/global/changed");
		}
	});

	// Min shade level change
	listener.startListening({
		actionCreator: setMinShadeLevel,
		effect: (action, api) => {
			api.cancelActiveListeners();
			if (action.payload.save) saveMinShadeLevel(action.payload.level);
			if (action.payload.apply) ipcRenderer.invoke("monitors/brightness/change");
		}
	});

	// Max shade level change
	listener.startListening({
		actionCreator: setMaxShadeLevel,
		effect: (action, api) => {
			api.cancelActiveListeners();
			if (action.payload.save) saveMaxShadeLevel(action.payload.level);
			if (action.payload.apply) ipcRenderer.invoke("monitors/brightness/change");
		}
	});

	// Native mode toggle
	listener.startListening({
		actionCreator: setNative,
		effect: (action) => {
			saveNative(action.payload);
		}
	});

	// Brightness mode changes (add/edit/remove)
	listener.startListening({
		matcher: isAnyOf(addBrightnessMode, editBrightnessMode, removeBrightnessMode),
		effect: (_action, api) => {
			saveBrightnessModes(api.getState().app.brightnessModes);
		}
	});

	// Active brightness mode change
	listener.startListening({
		actionCreator: setActiveBrightnessMode,
		effect: (action, api) => {
			const mode = api.getState().app.brightnessModes.find((mode) => mode.id === action.payload.id);
			if (!action.payload.disableBrightness) {
				if (action.payload.silent) {
					api.dispatch(setBrightnessSilent(mode.brightness));
				} else {
					api.dispatch(setBrightness(mode.brightness));
				}
			}
			saveBrightnessModes(api.getState().app.brightnessModes);
		}
	});
}

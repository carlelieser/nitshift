import { configureStore, createListenerMiddleware, isAnyOf, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import {
	addBrightnessMode,
	addSchedule,
	appSlice,
	editBrightnessMode,
	editSchedule,
	refreshAvailableMonitors,
	removeBrightnessMode,
	removeSchedule,
	setActiveBrightnessMode,
	setActiveMonitor,
	setAppearance,
	setBrightness,
	setLicense,
	setMode,
	setMonitorBrightness,
	setMonitorDisabled,
	setMonitorMode,
	setMonitorName,
	setMonitors,
	setRefreshed,
	setSchedule,
	setTrialAvailability,
	setTrialStartDate,
} from "@reducers/app";
import {
	saveActiveMonitor,
	saveAppearance,
	saveBrightnessModes,
	saveGlobalBrightness,
	saveLicense,
	saveMode,
	saveMonitorNicknames,
	saveMonitors,
	saveSchedule,
	saveTrialAvailability,
	saveTrialStartDate,
} from "@renderer/storage";

import { clone, cloneDeep } from "lodash";
import { dayjs } from "@common/dayjs";
import { batch } from "react-redux";
import { AppState } from "@common/types";

import { ipcRenderer } from "electron";
import { remove, saveStartupSettings, STORE } from "./storage";
import { setBrightnessSilent, setStartupSettings } from "./reducers/app";

const listener: ListenerMiddlewareInstance<{ app: AppState }> = createListenerMiddleware();

listener.startListening({
	actionCreator: setLicense,
	effect: async (action, api) => {
		const state = cloneDeep(api.getState());

		saveLicense(action.payload);

		if (action.payload === "free") {
			const activeMonitorIndex = state.app.monitors.findIndex(({ id }) => id === state.app.activeMonitor?.id);
			const shouldResetActiveMonitor = activeMonitorIndex > 1 || activeMonitorIndex === -1;
			if (shouldResetActiveMonitor) {
				api.dispatch(setActiveMonitor(state.app.monitors?.[0]?.id));
			}
			api.dispatch(refreshAvailableMonitors());
		}

		if (action.payload === "trial" || action.payload === "premium") {
			api.dispatch(
				setMonitors(
					state.app.monitors.map((monitor) => {
						monitor.disabled = false;
						return monitor;
					})
				)
			);
		}

		await ipcRenderer.invoke("sync-user");
	},
});

listener.startListening({
	actionCreator: setTrialStartDate,
	effect: async (action, api) => {
		saveTrialStartDate(action.payload);

		if (action.payload !== null) {
			batch(() => {
				api.dispatch(setLicense("trial"));
				api.dispatch(setTrialAvailability(false));
			});
			await ipcRenderer.invoke("free-trial-started");
		}

		await ipcRenderer.invoke("sync-user");
	},
});

listener.startListening({
	actionCreator: setTrialAvailability,
	effect: async (action) => {
		saveTrialAvailability(action.payload);
		await ipcRenderer.invoke("sync-user");
	},
});

listener.startListening({
	actionCreator: setActiveMonitor,
	effect: (_action, api) => {
		const monitor = api.getState().app.activeMonitor;
		if (monitor) saveActiveMonitor(monitor);
		else remove(STORE.ACTIVE_MONITOR);
	},
});

listener.startListening({
	actionCreator: setMode,
	effect: (action) => {
		saveMode(action.payload);
		ipcRenderer.invoke("app/mode-changed", action.payload);
	},
});

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
						disableBrightness: true,
					})
				);
			}

			if (state.app.license !== "free" && state.app.activeMonitor !== null) api.dispatch(setActiveMonitor(null));
		});

		saveGlobalBrightness(action.payload);
		ipcRenderer.invoke("global-brightness-changed");
	},
});

listener.startListening({
	actionCreator: setBrightnessSilent,
	effect: (action) => {
		saveGlobalBrightness(action.payload);
		ipcRenderer.invoke("global-brightness-changed");
	},
});

listener.startListening({
	actionCreator: setMonitorName,
	effect: (action, api) => {
		const state = cloneDeep(api.getState());
		const relevantSchedules = state.app.schedule.filter(({ monitors }) =>
			monitors.find((monitor) => monitor.id === action.payload.id)
		);
		saveMonitorNicknames(api.getState().app.monitorNicknames);

		if (relevantSchedules.length) {
			relevantSchedules.forEach((schedule) => {
				schedule.monitors = schedule.monitors.map((ref) => {
					const correspondingMonitor = state.app.monitors.find((monitor) => monitor.id === ref.id);
					return correspondingMonitor ? correspondingMonitor : ref;
				});
				api.dispatch(editSchedule(schedule));
			});
		}
	},
});

listener.startListening({
	matcher: isAnyOf(setMonitorBrightness, setMonitorDisabled, setMonitorMode, setMonitorName),
	effect: (action, api) => {
		api.dispatch(setActiveMonitor(action.payload.id));
		saveMonitors(api.getState().app.monitors);
	},
});

listener.startListening({
	actionCreator: setMonitorBrightness,
	effect: () => {
		ipcRenderer.invoke("monitor-brightness-changed");
	},
});

listener.startListening({
	actionCreator: setMonitorMode,
	effect: () => {
		ipcRenderer.invoke("monitor-mode-changed");
	},
});

listener.startListening({
	actionCreator: setMonitorDisabled,
	effect: () => {
		ipcRenderer.invoke("monitor-availability-changed");
	},
});

listener.startListening({
	actionCreator: setMonitors,
	effect: (action) => {
		saveMonitors(action.payload);
	},
});

listener.startListening({
	actionCreator: refreshAvailableMonitors,
	effect: (action, api) => {
		saveMonitors(api.getState().app.monitors);
		ipcRenderer.invoke("monitors-refreshed");
		if (action.payload) api.dispatch(setRefreshed(true));
	},
});

listener.startListening({
	matcher: isAnyOf(addSchedule, editSchedule, removeSchedule),
	effect: (_action, api) => {
		const schedule = clone(api.getState().app.schedule);
		schedule.sort((a, b) => {
			let timeA = dayjs(a.time, "h:mm A");
			let timeB = dayjs(b.time, "h:mm A");

			if (timeA.isAfter(timeB)) {
				return 1;
			} else if (timeA.isBefore(timeB)) {
				return -1;
			} else {
				return 0;
			}
		});
		saveSchedule(schedule);
		api.dispatch(setSchedule(schedule));
		ipcRenderer.invoke("schedule-changed");
	},
});

listener.startListening({
	matcher: isAnyOf(addBrightnessMode, editBrightnessMode, removeBrightnessMode),
	effect: (_action, api) => {
		saveBrightnessModes(api.getState().app.brightnessModes);
	},
});

listener.startListening({
	actionCreator: setStartupSettings,
	effect: (_action, api) => {
		const state = api.getState();
		saveStartupSettings(state.app.startup);
		ipcRenderer.send("launch/update");
	},
});

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
	},
});

listener.startListening({
	actionCreator: setAppearance,
	effect: (action) => {
		saveAppearance(action.payload);
	},
});

export const redux = configureStore({
	reducer: {
		app: appSlice.reducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware),
});

export type RootState = ReturnType<typeof redux.getState>;
export type AppDispatch = typeof redux.dispatch;

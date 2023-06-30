import { configureStore, createListenerMiddleware, isAnyOf, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import {
	appSlice,
	AppState,
	refreshAvailableMonitors,
	setTrialAvailability,
	setActiveMonitor,
	setBrightness,
	setLicense,
	setMode,
	setMonitorBrightness,
	setMonitorDisabled,
	setMonitorMode,
	setRefreshed,
	setTransitioning,
	setTrialStartDate,
	setMonitors,
	addSchedule,
	removeSchedule,
	editSchedule,
	setSchedule,
	setMonitorName,
} from "./reducers/app";
import {
	saveActiveMonitor,
	saveGlobalBrightness,
	saveLicense,
	saveMode,
	saveMonitors,
	saveSchedule,
	saveTrialAvailability,
	saveTrialStartDate,
	storage,
	STORE,
} from "../common/storage";
import { ipcRenderer } from "electron";
import { clone } from "lodash";
import { dayjs } from "../common/dayjs";

const listener: ListenerMiddlewareInstance<{ app: AppState }> = createListenerMiddleware();

listener.startListening({
	actionCreator: setLicense,
	effect: async (action, api) => {
		saveLicense(action.payload);

		if (action.payload === "free") {
			const state = api.getState();
			const activeMonitorIndex = state.app.monitors.findIndex(({ id }) => id === state.app.activeMonitor?.id);
			const shouldResetActiveMonitor = activeMonitorIndex > 1 || activeMonitorIndex === -1;
			if (shouldResetActiveMonitor) {
				api.dispatch(setActiveMonitor(api.getState().app.monitors?.[0]?.id));
			}
			api.dispatch(refreshAvailableMonitors());
		}

		await ipcRenderer.invoke("sync-user");
	},
});

listener.startListening({
	actionCreator: setTrialStartDate,
	effect: async (action, api) => {
		saveTrialStartDate(action.payload);

		if (action.payload !== null) {
			api.dispatch(setLicense("trial"));
			api.dispatch(setTrialAvailability(false));
			await ipcRenderer.invoke("free-trial-started");
		}

		await ipcRenderer.invoke("sync-user");
	},
});

listener.startListening({
	actionCreator: setTrialAvailability,
	effect: async (action, api) => {
		saveTrialAvailability(action.payload);
		await ipcRenderer.invoke("sync-user");
	},
});

listener.startListening({
	actionCreator: setActiveMonitor,
	effect: (action, api) => {
		const monitor = api.getState().app.activeMonitor;
		if (monitor) saveActiveMonitor(monitor);
		else storage().delete(STORE.ACTIVE_MONITOR);
	},
});

listener.startListening({
	actionCreator: setMode,
	effect: (action, api) => {
		saveMode(action.payload);
		ipcRenderer.invoke("mode-changed", action.payload);
	},
});

listener.startListening({
	actionCreator: setBrightness,
	effect: (action, api) => {
		api.dispatch(setActiveMonitor(null));
		saveGlobalBrightness(action.payload);
		ipcRenderer.invoke("global-brightness-changed");
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
	effect: (action, api) => {
		ipcRenderer.invoke("monitor-brightness-changed");
	},
});

listener.startListening({
	actionCreator: setMonitorMode,
	effect: (action, api) => {
		ipcRenderer.invoke("monitor-mode-changed");
	},
});

listener.startListening({
	actionCreator: setMonitorDisabled,
	effect: (action, api) => {
		ipcRenderer.invoke("monitor-availability-changed");
	},
});

listener.startListening({
	actionCreator: setMonitors,
	effect: (action, api) => {
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
	effect: (action, api) => {
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
		ipcRenderer.invoke("schedule-modified");
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

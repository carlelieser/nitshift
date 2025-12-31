import { isAnyOf, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { ipcRenderer } from "electron";
import { cloneDeep } from "lodash";
import { AppState } from "@common/types";
import {
	editSchedule,
	refreshAvailableMonitors,
	setActiveMonitor,
	setMonitorBrightness,
	setMonitorDisabled,
	setMonitorMode,
	setMonitorName,
	setMonitors,
	setRefreshed
} from "@reducers/app";
import {
	remove,
	saveMonitorNicknames,
	saveMonitors,
	STORE
} from "@renderer/storage";

export function setupMonitorListeners(listener: ListenerMiddlewareInstance<{ app: AppState }>) {
	// Active monitor selection
	listener.startListening({
		actionCreator: setActiveMonitor,
		effect: (_action, api) => {
			const monitor = api.getState().app.activeMonitor;
			if (monitor) remove(STORE.ACTIVE_MONITOR);
		}
	});

	// Monitor name changes - also update related schedules
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
		}
	});

	// Save monitors on any monitor change
	listener.startListening({
		matcher: isAnyOf(setMonitorBrightness, setMonitorDisabled, setMonitorMode, setMonitorName),
		effect: async (_, api) => {
			api.cancelActiveListeners();
			saveMonitors(api.getState().app.monitors);
		}
	});

	// Set active monitor on any monitor change
	listener.startListening({
		matcher: isAnyOf(setMonitorBrightness, setMonitorDisabled, setMonitorMode, setMonitorName),
		effect: (action, api) => {
			// @ts-ignore
			api.dispatch(setActiveMonitor(action.payload.id));
		}
	});

	// Monitor brightness change - notify main process
	listener.startListening({
		actionCreator: setMonitorBrightness,
		effect: (action) => {
			ipcRenderer.invoke("monitors/brightness/change", action.payload);
		}
	});

	// Monitor mode change - notify main process
	listener.startListening({
		actionCreator: setMonitorMode,
		effect: () => {
			ipcRenderer.invoke("monitors/mode/change");
		}
	});

	// Monitor disabled state change - notify main process
	listener.startListening({
		actionCreator: setMonitorDisabled,
		effect: () => {
			ipcRenderer.invoke("monitors/availability/change");
		}
	});

	// Monitor list reordering
	listener.startListening({
		actionCreator: setMonitors,
		effect: (action) => {
			saveMonitors(action.payload);
		}
	});

	// Monitor refresh
	listener.startListening({
		actionCreator: refreshAvailableMonitors,
		effect: (action, api) => {
			const state = api.getState();
			const monitors = state.app.monitors;
			const prevActiveMonitor = state.app.activeMonitor;

			if (prevActiveMonitor) {
				const firstConnectedMonitor = monitors.find((monitor) => monitor.connected);
				const newActiveMonitor = monitors.find((monitor) => monitor.id === prevActiveMonitor.id);

				if (!newActiveMonitor?.connected) api.dispatch(setActiveMonitor(firstConnectedMonitor.id));
			}

			saveMonitors(monitors);
			ipcRenderer.invoke("monitors/refreshed");
			if (action.payload) api.dispatch(setRefreshed(true));
		}
	});
}

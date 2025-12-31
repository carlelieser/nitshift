import type { PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";
import { uniqBy } from "lodash";
import { AppState, UIMonitor } from "@common/types";
import { loadMonitors } from "@renderer/storage";

// Types
type MonitorAction<T> = { id: string } & T;
type MonitorMode = UIMonitor["mode"];

interface MonitorActionPayload {
	nickname: string;
	brightness: number;
	disabled: boolean;
	mode: MonitorMode;
}

export type SetMonitorBrightnessAction = MonitorAction<
	Pick<UIMonitor, "brightness" | "mode" | "disabled" | "position" | "size">
>;
export type SetMonitorDisabledAction = MonitorAction<Pick<MonitorActionPayload, "disabled">>;
export type SetMonitorModeAction = MonitorAction<Pick<MonitorActionPayload, "mode">>;
export type SetMonitorNameAction = MonitorAction<Pick<MonitorActionPayload, "nickname">>;

// Helpers
export const findMonitorIndexById = (monitors: UIMonitor[], id: string) =>
	monitors.findIndex((monitor) => monitor.id === id);

// Reducers
export const monitorReducers = {
	refreshAvailableMonitors: (state: Draft<AppState>, _: PayloadAction<boolean>) => {
		state.monitors = loadMonitors();
	},

	setActiveMonitor: (state: Draft<AppState>, action: PayloadAction<AppState["activeMonitor"]["id"]>) => {
		state.activeMonitor = state.monitors.find(({ id }) => id === action.payload);
	},

	setMonitors: (state: Draft<AppState>, action: PayloadAction<AppState["monitors"]>) => {
		state.monitors = action.payload;
	},

	setMonitorBrightness: (state: Draft<AppState>, action: PayloadAction<SetMonitorBrightnessAction>) => {
		const { id, brightness } = action.payload;
		const index = findMonitorIndexById(state.monitors, id);
		state.monitors[index].brightness = brightness;
	},

	setMonitorDisabled: (state: Draft<AppState>, action: PayloadAction<SetMonitorDisabledAction>) => {
		const { id, disabled } = action.payload;
		const monitorIndex = findMonitorIndexById(state.monitors, id);
		state.monitors[monitorIndex].disabled = disabled;
	},

	setMonitorMode: (state: Draft<AppState>, action: PayloadAction<SetMonitorModeAction>) => {
		const { id, mode } = action.payload;
		const monitorIndex = findMonitorIndexById(state.monitors, id);
		state.monitors[monitorIndex].mode = mode;
	},

	setMonitorName: (state: Draft<AppState>, action: PayloadAction<SetMonitorNameAction>) => {
		const monitorIndex = findMonitorIndexById(state.monitors, action.payload.id);
		const monitorNicknameIndex = state.monitorNicknames.findIndex((tuple) => tuple[0] === action.payload.id);
		const nicknamePair: [string, string] = [action.payload.id, action.payload.nickname];

		state.monitors[monitorIndex].nickname = action.payload.nickname;

		if (monitorNicknameIndex > 0) {
			state.monitorNicknames[monitorNicknameIndex] = nicknamePair;
		} else {
			state.monitorNicknames = [...state.monitorNicknames, nicknamePair];
		}

		state.monitorNicknames = uniqBy(state.monitorNicknames, 0);
	}
};

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import {
	loadActiveMonitor,
	loadBrightnessModes,
	loadGlobalBrightness,
	loadLicense,
	loadMode,
	loadMonitorNicknames,
	loadMonitors,
	loadSchedule,
	loadTrialAvailability,
	loadTrialStartDate,
	loadUserEmail,
	loadUserId,
} from "../../common/storage";
import { UIMonitor } from "../../common/types";
import { Draft } from "immer";
import { merge } from "lodash";
import { randomUUID } from "crypto";

export interface ScheduleItemContent {
	monitors: Array<UIMonitor>;
	time: string;
	brightness: number;
}

export interface ScheduleItem extends ScheduleItemContent {
	id: string;
}

export interface BrightnessMode {
	id?: string;
	label: string;
	active: boolean;
	brightness: number;
	icon: string;
	removable: boolean;
}

export interface AppState {
	[key: string]: any;

	activeMonitor: UIMonitor | null;
	brightness: number;
	brightnessModes: Array<BrightnessMode>;
	license: "free" | "trial" | "premium";
	mode: "expanded" | "compact";
	monitors: Array<UIMonitor>;
	monitorNicknames: Array<[string, string]>;
	receivedPremium: boolean;
	refreshed: boolean;
	schedule: Array<ScheduleItem>;
	trialAvailability: boolean;
	trialStartDate: number | null;
	transitioning: boolean;
	userId: string | null;
	userEmail: string | null;
}

type MonitorAction<T> = { id: string } & T;

type MonitorMode = UIMonitor["mode"];

interface MonitorActionPayload {
	nickname: string;
	brightness: number;
	disabled: boolean;
	mode: MonitorMode;
}

export type SetMonitorBrightnessAction = MonitorAction<Pick<MonitorActionPayload, "brightness">>;
export type SetMonitorDisabledAction = MonitorAction<Pick<MonitorActionPayload, "disabled">>;
export type SetMonitorModeAction = MonitorAction<Pick<MonitorActionPayload, "mode">>;
export type SetMonitorNameAction = MonitorAction<Pick<MonitorActionPayload, "nickname">>;

const findMonitorIndexById = (monitors: UIMonitor[], id: string) => monitors.findIndex((monitor) => monitor.id === id);

const initialState: AppState = {
	activeMonitor: loadActiveMonitor(),
	brightness: loadGlobalBrightness(),
	brightnessModes: loadBrightnessModes(),
	license: loadLicense(),
	mode: loadMode(),
	monitors: loadMonitors(),
	monitorNicknames: loadMonitorNicknames(),
	receivedPremium: false,
	refreshed: false,
	schedule: loadSchedule(),
	transitioning: false,
	trialAvailability: loadTrialAvailability(),
	trialStartDate: loadTrialStartDate(),
	userEmail: loadUserEmail(),
	userId: loadUserId(),
};

const createReducer =
	<T>(key: keyof AppState) =>
	(state: Draft<AppState>, action: PayloadAction<T>) => {
		state[key] = action.payload;
	};

export const appSlice = createSlice({
	name: "app",
	initialState,
	reducers: {
		addBrightnessMode: (state, action: PayloadAction<BrightnessMode>) => {
			state.brightnessModes.push(merge({ id: randomUUID() }, action.payload));
		},
		addSchedule: (state, action: PayloadAction<ScheduleItemContent>) => {
			state.schedule.push(merge({ id: randomUUID() }, action.payload));
		},
		editBrightnessMode: (state, action: PayloadAction<Partial<BrightnessMode>>) => {
			let index = state.brightnessModes.findIndex((mode) => mode.id === action.payload.id);
			state.brightnessModes[index] = merge({}, state.brightnessModes[index], action.payload);
			console.log(state.brightnessModes[index]);
		},
		editSchedule: (state, action: PayloadAction<ScheduleItem>) => {
			let index = state.schedule.findIndex((schedule) => schedule.id === action.payload.id);
			state.schedule[index] = action.payload;
		},
		refreshAvailableMonitors: (state, payload: PayloadAction<boolean>) => {
			state.monitors = loadMonitors();
		},
		removeBrightnessMode: (state, action: PayloadAction<string>) => {
			state.brightnessModes = state.brightnessModes.filter(({ id }) => id !== action.payload);
		},
		removeSchedule: (state, action: PayloadAction<string>) => {
			state.schedule = state.schedule.filter(({ id }) => id !== action.payload);
		},
		setActiveBrightnessMode: (state, action: PayloadAction<string>) => {
			state.brightnessModes = state.brightnessModes.map((mode) => merge({}, mode, { active: false }));
			state.brightnessModes = state.brightnessModes.map((mode) =>
				mode.id === action.payload ? merge({}, mode, { active: true }) : mode
			);
		},
		setActiveMonitor: (state, action: PayloadAction<AppState["activeMonitor"]["id"]>) => {
			state.activeMonitor = state.monitors.find(({ id }) => id === action.payload);
		},
		setBrightness: createReducer<AppState["brightness"]>("brightness"),
		setLicense: createReducer<AppState["license"]>("license"),
		setMode: createReducer<AppState["mode"]>("mode"),
		setMonitorBrightness: (state, action: PayloadAction<SetMonitorBrightnessAction>) => {
			const { id, brightness } = action.payload;
			const monitorIndex = findMonitorIndexById(state.monitors, id);
			if (monitorIndex > -1) {
				state.monitors[monitorIndex].brightness = brightness;
			}
		},
		setMonitorDisabled: (state, action: PayloadAction<SetMonitorDisabledAction>) => {
			const { id, disabled } = action.payload;
			const monitorIndex = findMonitorIndexById(state.monitors, id);
			state.monitors[monitorIndex].disabled = disabled;
		},
		setMonitorMode: (state, action: PayloadAction<SetMonitorModeAction>) => {
			const { id, mode } = action.payload;
			const monitorIndex = findMonitorIndexById(state.monitors, id);
			state.monitors[monitorIndex].mode = mode;
		},
		setMonitorName: (state, action: PayloadAction<SetMonitorNameAction>) => {
			const monitorIndex = findMonitorIndexById(state.monitors, action.payload.id);
			const monitorNicknameIndex = state.monitorNicknames.findIndex((tuple) => tuple[0] === action.payload.id);
			const nicknamePair: [string, string] = [action.payload.id, action.payload.nickname];

			state.monitors[monitorIndex].nickname = action.payload.nickname;

			if (monitorNicknameIndex > 0) {
				state.monitorNicknames[monitorNicknameIndex] = nicknamePair;
			} else {
				state.monitorNicknames = [...state.monitorNicknames, nicknamePair];
			}
		},
		setMonitors: createReducer<AppState["monitors"]>("monitors"),
		setReceivedPremium: createReducer<AppState["receivedPremium"]>("receivedPremium"),
		setRefreshed: createReducer<AppState["refreshed"]>("refreshed"),
		setSchedule: createReducer<AppState["schedule"]>("schedule"),
		setTrialAvailability: createReducer<AppState["trialAvailability"]>("trialAvailability"),
		setTrialStartDate: createReducer<AppState["trialStartDate"]>("trialStartDate"),
		setTransitioning: createReducer<AppState["transitioning"]>("transitioning"),
		syncLicenseData: (state) => {
			state.trialStartDate = loadTrialStartDate();
			state.trialAvailability = loadTrialAvailability();
			state.license = loadLicense();
		},
	},
});

export const {
	addBrightnessMode,
	addSchedule,
	editBrightnessMode,
	editSchedule,
	refreshAvailableMonitors,
	removeBrightnessMode,
	removeSchedule,
	setActiveBrightnessMode,
	setActiveMonitor,
	setBrightness,
	setLicense,
	setMode,
	setMonitorBrightness,
	setMonitorDisabled,
	setMonitorMode,
	setMonitorName,
	setMonitors,
	setReceivedPremium,
	setRefreshed,
	setSchedule,
	setTrialAvailability,
	setTrialStartDate,
	setTransitioning,
	syncLicenseData,
} = appSlice.actions;

export default appSlice.reducer;

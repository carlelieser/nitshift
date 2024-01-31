import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import {
	loadActiveMonitor,
	loadAppearance,
	loadBrightnessModes,
	loadGlobalBrightness,
	loadLicense,
	loadMode,
	loadMonitorNicknames,
	loadMonitors,
	loadSchedule,
	loadStartupSettings,
	loadTrialAvailability,
	loadTrialStartDate,
	loadUserEmail,
	loadUserId,
} from "@renderer/storage";
import { AppState, BrightnessModeData, ScheduleItem, ScheduleItemContent, UIMonitor } from "@common/types";
import { Draft } from "immer";
import { merge, uniqBy } from "lodash";
import { randomUUID } from "crypto";
import update from "immutability-helper";

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
	appearance: loadAppearance(),
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
	startup: loadStartupSettings(),
	focused: false,
	release: null,
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
		addBrightnessMode: (state, action: PayloadAction<BrightnessModeData>) => {
			state.brightnessModes.push(merge({ id: randomUUID() }, action.payload));
		},
		addSchedule: (state, action: PayloadAction<ScheduleItemContent>) => {
			state.schedule.push(merge({ id: randomUUID() }, action.payload));
		},
		editBrightnessMode: (state, action: PayloadAction<Partial<BrightnessModeData>>) => {
			let index = state.brightnessModes.findIndex((mode) => mode.id === action.payload.id);
			state.brightnessModes = update(state.brightnessModes, {
				[index]: {
					$merge: action.payload,
				},
			});
		},
		setBrightnessModes: (state, action: PayloadAction<Array<BrightnessModeData>>) => {
			state.brightnessModes = action.payload;
		},
		setFocused: (state, action: PayloadAction<boolean>) => {
			state.focused = action.payload;
		},
		editSchedule: (state, action: PayloadAction<ScheduleItem>) => {
			let index = state.schedule.findIndex((schedule) => schedule.id === action.payload.id);
			state.schedule[index] = action.payload;
		},
		refreshAvailableMonitors: (state, action: PayloadAction<boolean>) => {
			console.log("force refresh monitors: ", action.payload);
			state.monitors = loadMonitors();
		},
		removeBrightnessMode: (state, action: PayloadAction<string>) => {
			state.brightnessModes = state.brightnessModes.filter(({ id }) => id !== action.payload);
		},
		removeSchedule: (state, action: PayloadAction<string>) => {
			state.schedule = state.schedule.filter(({ id }) => id !== action.payload);
		},
		setActiveBrightnessMode: (
			state,
			action: PayloadAction<{ id: string; silent?: boolean; disableBrightness?: boolean }>
		) => {
			state.brightnessModes = update(state.brightnessModes, {
				$apply: (value) => value.map((mode) => ({ ...mode, active: mode.id === action.payload.id })),
			});
		},
		setActiveMonitor: (state, action: PayloadAction<AppState["activeMonitor"]["id"]>) => {
			state.activeMonitor = state.monitors.find(({ id }) => id === action.payload);
		},
		setAppearance: createReducer<AppState["appearance"]>("appearance"),
		setBrightness: createReducer<AppState["brightness"]>("brightness"),
		setBrightnessSilent: createReducer<AppState["brightness"]>("brightness"),
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

			state.monitorNicknames = uniqBy(state.monitorNicknames, 0);
		},
		setMonitors: createReducer<AppState["monitors"]>("monitors"),
		setReceivedPremium: createReducer<AppState["receivedPremium"]>("receivedPremium"),
		setRefreshed: createReducer<AppState["refreshed"]>("refreshed"),
		setRelease: createReducer<AppState["release"]>("release"),
		setSchedule: createReducer<AppState["schedule"]>("schedule"),
		setStartupSettings: createReducer<AppState["startup"]>("startup"),
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
	setAppearance,
	setBrightness,
	setBrightnessModes,
	setBrightnessSilent,
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
	setFocused,
	setRelease,
	setStartupSettings,
} = appSlice.actions;

export default appSlice.reducer;

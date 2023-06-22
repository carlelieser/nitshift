import {createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import {
    loadActiveMonitor,
    loadGlobalBrightness,
    loadLicense,
    loadMode,
    loadMonitors,
    loadSchedule,
    loadTrialAvailability,
    loadTrialStartDate,
    loadUserEmail,
    loadUserId,
} from "../../common/storage";
import {UIMonitor} from "../../common/types";
import {Draft} from "immer";
import {merge} from "lodash";
import {randomUUID} from "crypto";

export interface ScheduleItemContent {
    monitors: Array<string>;
    time: string;
    brightness: number;
}

export interface ScheduleItem extends ScheduleItemContent {
    id: string;
}

export interface AppState {
    [key: string]: any;

    activeMonitor: UIMonitor | null;
    brightness: number;
    license: "free" | "trial" | "premium";
    mode: "expanded" | "compact";
    monitors: Array<UIMonitor>;
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
    brightness: number;
    disabled: boolean;
    mode: MonitorMode;
}

export type SetMonitorBrightnessAction = MonitorAction<Pick<MonitorActionPayload, "brightness">>;
export type SetMonitorDisabledAction = MonitorAction<Pick<MonitorActionPayload, "disabled">>;
export type SetMonitorModeAction = MonitorAction<Pick<MonitorActionPayload, "mode">>;

const findMonitorIndexById = (monitors: UIMonitor[], id: string) => monitors.findIndex((monitor) => monitor.id === id);

const initialState: AppState = {
    activeMonitor: loadActiveMonitor(),
    brightness: loadGlobalBrightness(),
    license: loadLicense(),
    mode: loadMode(),
    monitors: loadMonitors(),
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
        addSchedule: (state, action: PayloadAction<ScheduleItemContent>) => {
            state.schedule.push(merge({id: randomUUID()}, action.payload));
        },
        editSchedule: (state, action: PayloadAction<ScheduleItem>) => {
            let index = state.schedule.findIndex((schedule) => schedule.id === action.payload.id);
            state.schedule[index] = action.payload;
        },
        refreshAvailableMonitors: (state, payload: PayloadAction<boolean>) => {
            state.monitors = loadMonitors();
        },
        removeSchedule: (state, action: PayloadAction<string>) => {
            state.schedule = state.schedule.filter(({id}) => id !== action.payload);
        },
        setActiveMonitor: (state, action: PayloadAction<AppState["activeMonitor"]["id"]>) => {
            state.activeMonitor = state.monitors.find(({id}) => id === action.payload);
        },
        setBrightness: createReducer<AppState["brightness"]>("brightness"),
        setLicense: createReducer<AppState["license"]>("license"),
        setMode: createReducer<AppState["mode"]>("mode"),
        setMonitorBrightness: (state, action: PayloadAction<SetMonitorBrightnessAction>) => {
            const {id, brightness} = action.payload;
            const monitorIndex = findMonitorIndexById(state.monitors, id);
            state.monitors[monitorIndex].brightness = brightness;
        },
        setMonitorDisabled: (state, action: PayloadAction<SetMonitorDisabledAction>) => {
            const {id, disabled} = action.payload;
            const monitorIndex = findMonitorIndexById(state.monitors, id);
            state.monitors[monitorIndex].disabled = disabled;
        },
        setMonitorMode: (state, action: PayloadAction<SetMonitorModeAction>) => {
            const {id, mode} = action.payload;
            const monitorIndex = findMonitorIndexById(state.monitors, id);
            state.monitors[monitorIndex].mode = mode;
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
    addSchedule,
    editSchedule,
    refreshAvailableMonitors,
    removeSchedule,
    setActiveMonitor,
    setBrightness,
    setLicense,
    setMode,
    setMonitorBrightness,
    setMonitorDisabled,
    setMonitorMode,
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

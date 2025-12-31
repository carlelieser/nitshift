import type { PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";
import { merge } from "lodash";
import { randomUUID } from "crypto";
import { AppState, ScheduleItem, ScheduleItemContent } from "@common/types";

// Reducers
export const scheduleReducers = {
	addSchedule: (state: Draft<AppState>, action: PayloadAction<ScheduleItemContent>) => {
		state.schedule.push(merge({ id: randomUUID() }, action.payload));
	},

	editSchedule: (state: Draft<AppState>, action: PayloadAction<ScheduleItem>) => {
		let index = state.schedule.findIndex((schedule) => schedule.id === action.payload.id);
		state.schedule[index] = action.payload;
	},

	removeSchedule: (state: Draft<AppState>, action: PayloadAction<string>) => {
		state.schedule = state.schedule.filter(({ id }) => id !== action.payload);
	},

	setSchedule: (state: Draft<AppState>, action: PayloadAction<AppState["schedule"]>) => {
		state.schedule = action.payload;
	}
};

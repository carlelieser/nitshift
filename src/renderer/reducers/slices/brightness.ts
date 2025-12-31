import type { PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";
import { merge } from "lodash";
import { randomUUID } from "crypto";
import update from "immutability-helper";
import { AppState, BrightnessModeData } from "@common/types";

// Reducers
export const brightnessReducers = {
	addBrightnessMode: (state: Draft<AppState>, action: PayloadAction<BrightnessModeData>) => {
		state.brightnessModes.push(merge({ id: randomUUID() }, action.payload));
	},

	editBrightnessMode: (state: Draft<AppState>, action: PayloadAction<Partial<BrightnessModeData>>) => {
		let index = state.brightnessModes.findIndex((mode) => mode.id === action.payload.id);
		state.brightnessModes = update(state.brightnessModes, {
			[index]: {
				$merge: action.payload
			}
		});
	},

	removeBrightnessMode: (state: Draft<AppState>, action: PayloadAction<string>) => {
		state.brightnessModes = state.brightnessModes.filter(({ id }) => id !== action.payload);
	},

	setActiveBrightnessMode: (
		state: Draft<AppState>,
		action: PayloadAction<{ id: string; silent?: boolean; disableBrightness?: boolean }>
	) => {
		state.brightnessModes = update(state.brightnessModes, {
			$apply: (value) => value.map((mode) => ({ ...mode, active: mode.id === action.payload.id }))
		});
	},

	setBrightness: (state: Draft<AppState>, action: PayloadAction<AppState["brightness"]>) => {
		state.brightness = action.payload;
	},

	setBrightnessSilent: (state: Draft<AppState>, action: PayloadAction<AppState["brightness"]>) => {
		state.brightness = action.payload;
	},

	setBrightnessModes: (state: Draft<AppState>, action: PayloadAction<Array<BrightnessModeData>>) => {
		state.brightnessModes = action.payload;
	},

	setNative: (state: Draft<AppState>, action: PayloadAction<AppState["native"]>) => {
		state.native = action.payload;
	},

	setMinShadeLevel: (state: Draft<AppState>, action: PayloadAction<{ level: number; save?: boolean; apply?: boolean }>) => {
		state.minShadeLevel = action.payload.level;
	},

	setMaxShadeLevel: (state: Draft<AppState>, action: PayloadAction<{ level: number; save?: boolean; apply?: boolean }>) => {
		state.maxShadeLevel = action.payload.level;
	}
};

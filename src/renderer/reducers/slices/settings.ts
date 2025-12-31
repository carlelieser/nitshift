import type { PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";
import { AppState } from "@common/types";

// Reducers
export const settingsReducers = {
	setAppearance: (state: Draft<AppState>, action: PayloadAction<AppState["appearance"]>) => {
		state.appearance = action.payload;
	},

	setSyncAppearance: (state: Draft<AppState>, action: PayloadAction<AppState["syncAppearance"]>) => {
		state.syncAppearance = action.payload;
	},

	setAutoUpdateCheck: (state: Draft<AppState>, action: PayloadAction<AppState["autoUpdateCheck"]>) => {
		state.autoUpdateCheck = action.payload;
	},

	setAutoResize: (state: Draft<AppState>, action: PayloadAction<AppState["autoResize"]>) => {
		state.autoResize = action.payload;
	},

	setStartupSettings: (state: Draft<AppState>, action: PayloadAction<AppState["startup"]>) => {
		state.startup = action.payload;
	}
};

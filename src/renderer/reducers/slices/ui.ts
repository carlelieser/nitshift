import type { PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";
import { AppState } from "@common/types";

// Reducers
export const uiReducers = {
	setMode: (state: Draft<AppState>, action: PayloadAction<AppState["mode"]>) => {
		state.mode = action.payload;
	},

	setPrevMode: (state: Draft<AppState>, action: PayloadAction<AppState["prevMode"]>) => {
		state.prevMode = action.payload;
	},

	setTransitioning: (state: Draft<AppState>, action: PayloadAction<AppState["transitioning"]>) => {
		state.transitioning = action.payload;
	},

	setFocused: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
		state.focused = action.payload;
	},

	setRefreshed: (state: Draft<AppState>, action: PayloadAction<AppState["refreshed"]>) => {
		state.refreshed = action.payload;
	},

	setRelease: (state: Draft<AppState>, action: PayloadAction<AppState["release"]>) => {
		state.release = action.payload;
	},

	setSettingsDialogOpen: (state: Draft<AppState>, action: PayloadAction<AppState["settingsDialogOpen"]>) => {
		state.settingsDialogOpen = action.payload;
	}
};

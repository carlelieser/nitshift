// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import { ipcRenderer } from "electron";
import { AppState } from "@common/types";

export const STORE = {
	ACTIVE_MONITOR: "active-monitor",
	GLOBAL_BRIGHTNESS: "global-brightness",
	BRIGHTNESS_MODES: "brightness-modes",
	LAST_UPDATED_ON: "last-updated-on",
	LICENSE: "license",
	APPEARANCE: "dark",
	MODE: "mode",
	MONITORS: "monitors",
	MONITOR_NICKNAMES: "monitor-nicknames",
	SCHEDULE: "schedule",
	TRIAL_AVAILABILITY: "trail-availability",
	TRIAL_START_DATE: "trial-start-date",
	USER_EMAIL: "user-email",
	USER_ID: "user-id",
	STARTUP: "startup",
};

export const remove = (id) => ipcRenderer.sendSync("storage/remove", id);

{{{replacement}}}
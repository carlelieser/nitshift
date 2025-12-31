export * from "./monitors";
export * from "./brightness";
export * from "./schedule";
export * from "./ui";
export * from "./settings";

import { monitorReducers } from "./monitors";
import { brightnessReducers } from "./brightness";
import { scheduleReducers } from "./schedule";
import { uiReducers } from "./ui";
import { settingsReducers } from "./settings";

// Combined reducers for use in createSlice
export const combinedReducers = {
	...monitorReducers,
	...brightnessReducers,
	...scheduleReducers,
	...uiReducers,
	...settingsReducers
};

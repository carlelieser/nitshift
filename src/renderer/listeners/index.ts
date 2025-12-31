import { createListenerMiddleware, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { AppState } from "@common/types";
import { setupMonitorListeners } from "./monitors";
import { setupBrightnessListeners } from "./brightness";
import { setupScheduleListeners } from "./schedule";
import { setupSettingsListeners } from "./settings";

export function createAppListenerMiddleware(): ListenerMiddlewareInstance<{ app: AppState }> {
	const listener: ListenerMiddlewareInstance<{ app: AppState }> = createListenerMiddleware();

	// Setup all domain-specific listeners
	setupMonitorListeners(listener);
	setupBrightnessListeners(listener);
	setupScheduleListeners(listener);
	setupSettingsListeners(listener);

	return listener;
}

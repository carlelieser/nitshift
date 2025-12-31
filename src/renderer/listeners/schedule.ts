import { isAnyOf, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { ipcRenderer } from "electron";
import { clone } from "lodash";
import { dayjs } from "@common/dayjs";
import { AppState } from "@common/types";
import { addSchedule, editSchedule, removeSchedule, setSchedule } from "@reducers/app";
import { saveSchedule } from "@renderer/storage";

export function setupScheduleListeners(listener: ListenerMiddlewareInstance<{ app: AppState }>) {
	// Schedule changes (add/edit/remove) - sort by time and save
	listener.startListening({
		matcher: isAnyOf(addSchedule, editSchedule, removeSchedule),
		effect: (_action, api) => {
			const schedule = clone(api.getState().app.schedule);
			schedule.sort((a, b) => {
				let timeA = dayjs(a.time, "h:mm A");
				let timeB = dayjs(b.time, "h:mm A");

				if (timeA.isAfter(timeB)) {
					return 1;
				} else if (timeA.isBefore(timeB)) {
					return -1;
				} else {
					return 0;
				}
			});
			saveSchedule(schedule);
			api.dispatch(setSchedule(schedule));
			ipcRenderer.invoke("schedule-changed");
		}
	});
}

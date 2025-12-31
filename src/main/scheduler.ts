import { loadMonitors, loadSchedule, saveMonitors } from "@main/storage";
import { CronJob, CronTime } from "cron";
import { clone, difference, orderBy } from "lodash";
import { dayjs, DEFAULT_TIMEZONE, getDateFromTime } from "@common/dayjs";
import EventEmitter from "events";
import { ScheduleItem } from "../common/types";
import * as SunCalc from "suncalc";
import update from "immutability-helper";
import { getUserPosition } from "@common/fetch";

class Scheduler extends EventEmitter {
	private schedule: Record<string, CronJob> = {};

	public check = async () => {
		Object.values(this.schedule).forEach((job) => job.stop);

		const prevSchedules = await this.getHistory();
		const latestSchedule = prevSchedules[prevSchedules.length - 1];

		for await (let schedule of loadSchedule()) {
			schedule = await this.getSchedule(schedule.id);
			const cronTime = this.getCronTime(schedule);
			const job = new CronJob(
				cronTime,
				async () => {
					await this.apply(schedule.id);
				},
				null,
				true,
				DEFAULT_TIMEZONE
			);
			job.start();
			this.schedule[schedule.id] = job;
		}

		if (latestSchedule) await this.apply(latestSchedule.id);
	};

	private getCronTime = (schedule: ScheduleItem): string => {
		const date = getDateFromTime(schedule.time);
		return `0 ${date.minute()} ${date.hour()} * * *`;
	};

	private getSchedule = async (id: string) => {
		let schedule = loadSchedule().find((schedule) => schedule.id === id);

		if (!schedule) return;

		if (schedule.type !== "manual") {
			schedule = await this.updateSunSchedule(schedule);
		}

		return schedule;
	};

	private updateSunSchedule = async (schedule: ScheduleItem) => {
		const position = await getUserPosition();
		if (!position) return schedule;
		const times = SunCalc.getTimes(dayjs().toDate(), position.latitude, position.longitude);
		const sunTime = dayjs(times[schedule.type]);
		const time = sunTime.format("HH:mm A");
		return update(schedule, {
			time: { $set: time }
		});
	};

	private apply = async (id: string) => {
		const schedule = await this.getSchedule(id);
		const referenceMonitors = loadMonitors();
		const prevMonitors = loadMonitors();

		prevMonitors.forEach((monitor) => {
			if (schedule.monitors.find((ref) => ref.id === monitor.id)) monitor.brightness = schedule.brightness;
		});

		const updatedMonitors = clone(prevMonitors);

		saveMonitors(updatedMonitors);

		if (difference(referenceMonitors, updatedMonitors).length) this.emit("ready");

		const job = this.schedule[id];

		if (job && this.shouldUpdateJobTime(job, schedule)) {
			job.setTime(new CronTime(this.getCronTime(schedule)));
		}
	};

	private shouldUpdateJobTime = (job: CronJob, schedule: ScheduleItem) => {
		const nextDate = dayjs(job.nextDate().toJSDate());
		const date = getDateFromTime(schedule.time);
		return nextDate.hour() !== date.hour() || nextDate.minute() !== date.minute();
	};

	private getCorrectedSchedule = async () => {
		const schedules = loadSchedule();
		const corrected = [];

		for await (let schedule of schedules) {
			corrected.push(await this.getSchedule(schedule.id));
		}

		return corrected;
	};

	private getHistory = async () => {
		const schedule = await this.getCorrectedSchedule();
		const sorted = orderBy(schedule, "time", "asc");
		return sorted.filter((schedule) => dayjs().isAfter(getDateFromTime(schedule.time)));
	};
}

export default Scheduler;

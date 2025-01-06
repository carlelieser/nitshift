import { loadLicense, loadMonitors, loadSchedule, saveMonitors } from "@main/storage";
import { CronJob, CronTime } from "cron";
import { clone, difference } from "lodash";
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

		const prevSchedules = this.getHistory();
		const latestSchedule = prevSchedules[prevSchedules.length - 1];

		if (latestSchedule) await this.apply(latestSchedule.id);

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
	};

	private getCronTime = (schedule: ScheduleItem): string => {
		const date = getDateFromTime(schedule.time);
		return `0 ${date.minute()} ${date.hour()} * * *`;
	};

	private getSchedule = async (id: string) => {
		let schedule = loadSchedule().find((schedule) => schedule.id === id);

		if (!schedule) return;

		if (schedule.type === "sunrise" || schedule.type === "sunset") {
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
		if (loadLicense() === "free") return;

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

		if (this.shouldUpdateJobTime(job, schedule)) {
			job.setTime(new CronTime(this.getCronTime(schedule)));
		}
	};

	private shouldUpdateJobTime = (job: CronJob, schedule: ScheduleItem) => {
		const nextDate = dayjs(job.nextDate().toJSDate());
		const date = getDateFromTime(schedule.time);
		return nextDate.hour() !== date.hour() || nextDate.minute() !== date.minute();
	};

	private getHistory = () => {
		return loadSchedule().filter(({ time }) => {
			const currentTime = dayjs();
			const targetDate = getDateFromTime(time);
			const targetTime = dayjs().hour(targetDate.hour()).minute(targetDate.minute());
			return currentTime.isAfter(targetTime);
		});
	};
}

export default Scheduler;

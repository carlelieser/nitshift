import { loadLicense, loadMonitors, loadSchedule, saveMonitors } from "@main/storage";
import { CronJob } from "cron";
import { clone, difference } from "lodash";
import { dayjs, DEFAULT_TIMEZONE, getDateFromTime } from "@common/dayjs";
import EventEmitter from "events";

class Scheduler extends EventEmitter {
	private schedule: Array<CronJob> = [];

	public check = () => {
		this.schedule.forEach((job) => job.stop);

		const prevSchedules = this.getHistory();
		const latestSchedule = prevSchedules[prevSchedules.length - 1];

		if (latestSchedule) this.apply(latestSchedule.id);

		loadSchedule().forEach(({ id, time }) => {
			const date = getDateFromTime(time);
			const cron = `0 ${date.minute()} ${date.hour()} * * *`;
			const job = new CronJob(
				cron,
				() => {
					this.apply(id);
				},
				null,
				true,
				DEFAULT_TIMEZONE
			);
			job.start();
			this.schedule.push(job);
		});
	};

	private apply = (id: string) => {
		if (loadLicense() === "free") return;
		const schedule = loadSchedule().find((schedule) => schedule.id === id);
		if (!schedule) return;
		const referenceMonitors = loadMonitors();
		const prevMonitors = loadMonitors();
		prevMonitors.forEach((monitor) => {
			if (schedule.monitors.find((ref) => ref.id === monitor.id)) monitor.brightness = schedule.brightness;
		});
		const updatedMonitors = clone(prevMonitors);
		saveMonitors(updatedMonitors);
		if (difference(referenceMonitors, updatedMonitors).length) this.emit("ready");
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

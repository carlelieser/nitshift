import { dayjs, DEFAULT_TIMEZONE } from "@common/dayjs";
import { loadTrialStartDate, saveLicense, saveTrialAvailability, saveTrialStartDate } from "@main/storage";
import { isDev } from "@common/utils";
import { CronJob } from "cron";
import EventEmitter from "events";

const ONE_MINUTE = 1000 * 60;
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

const TRIAL_JOB_TIME = isDev ? "* * * * * *" : "0 * * * * *";
const TRIAL_DURATION = isDev ? ONE_MINUTE : SEVEN_DAYS;

class TrialManager extends EventEmitter {
	public check = (date: number) => dayjs().diff(date, "milliseconds") >= TRIAL_DURATION;

	public ping = (job: CronJob) => {
		const trialStartDate = loadTrialStartDate();
		if (trialStartDate) {
			if (this.check(trialStartDate)) {
				saveLicense("free");
				saveTrialStartDate(null);
				saveTrialAvailability(false);
				this.emit("expired", job);
			}
		}
	};

	public start = () => {
		const job: CronJob = new CronJob(TRIAL_JOB_TIME, () => this.ping(job), null, false, DEFAULT_TIMEZONE);
		job.start();
		this.ping(job);
	};
}

export default TrialManager;

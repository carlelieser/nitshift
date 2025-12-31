import { isDev } from "@common/utils";
import { loadLastUpdatedOn, saveLastUpdatedOn } from "@main/storage";
import { dayjs } from "@common/dayjs";
import release from "@common/release.json";
import EventEmitter from "events";

const GITHUB_API_URL = "https://api.github.com/repos/carlelieser/glimmr/releases/latest";

class Updater extends EventEmitter {
	private release: any = null;

	public getLatestRelease = async () => {
		const response = await fetch(GITHUB_API_URL, {
			headers: {
				Accept: "application/vnd.github.v3+json",
				"User-Agent": "glimmr-updater"
			}
		});
		return response.json();
	};

	public updateRelease = async () => {
		this.release = await this.getLatestRelease();
	};

	public check = async (force = false) => {
		if (!force) {
			const lastUpdatedOn = loadLastUpdatedOn();
			if (lastUpdatedOn) {
				const daysSinceLastUpdate = dayjs().diff(dayjs(lastUpdatedOn), "day");
				if (daysSinceLastUpdate < 1) return;
			}
		}

		await this.updateRelease();

		if (this.release) {
			const updateRequired = this.release.tag_name !== release.tag_name;
			if (updateRequired || isDev) {
				this.emit("update-available", this.release);
			}
		}

		saveLastUpdatedOn(dayjs().valueOf());
	};
}

export default Updater;

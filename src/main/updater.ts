import { isDev } from "@common/utils";
import { loadLastUpdatedOn, saveLastUpdatedOn } from "@main/storage";
import { dayjs } from "@common/dayjs";
import release from "@common/release.json";
import EventEmitter from "events";
import { Octokit } from "octokit";
import { GetResponseTypeFromEndpointMethod } from "@octokit/types";
import { git } from "./keys";

const API_CONFIG = {
	auth: git,
};

type ExtractChildType<T> = T extends Array<infer R> ? R : never;

class Updater extends EventEmitter {
	private api = new Octokit(API_CONFIG);
	private release: ExtractChildType<
		GetResponseTypeFromEndpointMethod<typeof this.api.rest.repos.listReleases>["data"]
	> = null;

	public getLatestRelease = async () => {
		try {
			const response = await this.api.rest.repos.listReleases({
				owner: "carlelieser",
				repo: "glimmr",
			});

			if (isDev) return response.data.shift();
			return response.data.find((release) => !release.draft && !release.prerelease);
		} catch (err) {
			console.log({
				message: "Failed to get latest release.",
				err,
			});
			return null;
		}
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

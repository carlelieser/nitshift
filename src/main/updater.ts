import fetch from "node-fetch";
import { isDev } from "../common/utils";
import { loadLastUpdatedOn, saveLastUpdatedOn } from "../common/storage";
import { dayjs } from "../common/dayjs";
import release from "../common/release.json";
import EventEmitter from "events";

export const ACCESS_TOKEN = "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";

export interface Asset {
	url: string;
	id: number;
	node_id: string;
	name: string;
	label: string;
	content_type: string;
	state: string;
	size: number;
	created_at: Date;
	updated_at: Date;
	browser_download_url: string;
}

export interface Release {
	url: string;
	assets_url: string;
	upload_url: string;
	html_url: string;
	id: number;
	node_id: string;
	tag_name: string;
	target_commitish: string;
	name: string;
	draft: boolean;
	prerelease: boolean;
	created_at: Date;
	published_at: Date;
	assets: Array<Asset>;
	body: string;
}

class Updater extends EventEmitter {
	private RELEASES_URL: string = "https://api.github.com/repos/carlelieser/glimmr/releases";
	private LATEST_RELEASE: Release = null;

	public available = (): Promise<null | Release> => {
		return fetch(this.RELEASES_URL, {
			headers: {
				Authorization: `Bearer ${ACCESS_TOKEN}`,
			},
		})
			.then((response) => response.json())
			.then((releases: Array<Release>) => {
				const latest = releases?.find((release) => (isDev ? release : !release.draft && !release.prerelease));
				if (!latest) return null;
				return latest;
			})
			.catch(() => {
				return null;
			});
	};

	public populate = async () => {
		this.LATEST_RELEASE = await this.available();
	};

	public check = async (force: boolean = false) => {
		if (!force) {
			const lastCheckedOn = loadLastUpdatedOn();
			if (lastCheckedOn) if (dayjs().diff(dayjs(lastCheckedOn), "day") < 1) return;
		}
		await this.populate();
		if (this.LATEST_RELEASE) {
			if (this.LATEST_RELEASE.tag_name !== release.tag_name) {
				this.emit("update-available", this.LATEST_RELEASE);
			}
		}
		saveLastUpdatedOn(dayjs().valueOf());
	};
}

export default Updater;

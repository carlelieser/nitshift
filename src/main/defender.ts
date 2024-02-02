import { storage } from "./storage";
import { app } from "electron";
import ProjectHasher from "./project-hasher";
import { main_id, version_id } from "./keys";
import { isDev } from "@common/utils";
import { safe } from "./safe";
import { isPackaged } from "./utils";

const SHA_256_LENGTH = 64;

class Defender {
	private id: string = storage().get(main_id);
	private version: string = storage().get(version_id);

	private hasher = new ProjectHasher({
		asar: isPackaged
	});

	public init = async () => {
		await this.load();
		this.defend();
	};

	public defend = () => {
		if (this.id !== this.version && !isDev) {
			app.quit();
			process.exit();
		}
	};

	private setAndStoreId = async () => {
		this.id = await this.hasher.hash(true);
		storage().set(main_id, this.id);
	};

	private setAndStoreVersion = (versionId: string) => {
		this.version = versionId;
		storage().set(version_id, versionId);
	};

	private loadId = async () => {
		await this.setAndStoreId();
		this.setAndStoreVersion(safe);
	};

	private load = () => {
		const isNotInitialized = !this.id;
		const isNotStandard = this.id?.length !== SHA_256_LENGTH;
		const versionChanged = this.version !== safe;
		const shouldUpdate = isNotInitialized || isNotStandard || isDev || versionChanged;

		if (shouldUpdate) return this.loadId();
	};
}

export default Defender;

import {
	loadLicense,
	loadTrialAvailability,
	loadTrialStartDate,
	loadUserId,
	saveLicense,
	saveTrialAvailability,
	saveTrialStartDate,
	saveUserId
} from "@main/storage";
import EventEmitter from "events";
import { isDev } from "@common/utils";
import { request } from "../common/fetch";
import { machineIdSync } from "node-machine-id";

class Auth extends EventEmitter {
	public createNewUser = async () => {
		const id = machineIdSync();
		saveUserId(id);
		saveTrialAvailability(true);
		await this.storeUser();
	};

	public updateUser = async () => {
		const id = loadUserId();
		const license = loadLicense();
		const trialStartDate = loadTrialStartDate();
		const trialAvailability = loadTrialAvailability();
		return request("/api/users", {
			method: "POST",
			body: JSON.stringify({
				id,
				license,
				trialStartDate,
				trialAvailability
			})
		});
	};

	public getUser = async () => {
		const id = loadUserId();
		const response = await request(`/api/users/${id}`);

		if (response.ok) {
			return response.json();
		}

		return null;
	};

	public storeUser = async () => {
		const user = await this.getUser();
		if (user) {
			saveLicense(user.license);
			saveTrialStartDate(user.trialStartDate);
			saveTrialAvailability(user.trialAvailability);
			this.emit("user-stored", user);
		} else {
			saveTrialAvailability(true);
			await this.updateUser();
		}
	};

	public init = async () => {
		const user = loadUserId();
		if (isDev) console.log(user);
		this.emit("init");
	};
}

export default Auth;

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { machineIdSync } from "node-machine-id";
import {
	loadLicense,
	loadTrialAvailability,
	loadTrialStartDate,
	loadUserEmail,
	loadUserId,
	saveLicense,
	saveTrialAvailability,
	saveTrialStartDate,
	saveUserEmail,
	saveUserId,
} from "@main/storage";
import EventEmitter from "events";
import { isDev } from "@common/utils";
import { encryption } from "./keys";

class Auth extends EventEmitter {
	public createNewUser = async () => {
		const auth = getAuth();
		const { id, email } = this.getIdAndEmail();
		saveUserId(id);
		saveUserEmail(email);
		saveTrialAvailability(true);
		return createUserWithEmailAndPassword(auth, email, encryption).then(this.updateUser).catch(this.storeUser);
	};

	public updateUser = async () => {
		try {
			const id = loadUserId();
			const email = loadUserEmail();
			await this.login();
			const license = loadLicense();
			const trialStartDate = loadTrialStartDate();
			const trialAvailability = loadTrialAvailability();
			const ref = doc(db, "users", email);
			await setDoc(
				ref,
				{
					id,
					email,
					license,
					trialStartDate,
					trialAvailability,
				},
				{ merge: true }
			);
		} catch (err) {
			console.log(err);
		}
	};

	public login = async () => {
		const auth = getAuth();
		const email = loadUserEmail();
		let userNotFound = false;
		return signInWithEmailAndPassword(auth, email, encryption)
			.catch((err) => {
				if (err.code === "auth/user-not-found") {
					userNotFound = true;
					return this.createNewUser();
				}
			})
			.finally(() => {
				if (userNotFound) return signInWithEmailAndPassword(auth, email, encryption);
			});
	};

	public storeUser = async () => {
		try {
			const email = loadUserEmail();
			await this.login();
			const docRef = doc(db, "users", email);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const user = docSnap.data();
				saveLicense(user.license);
				saveTrialStartDate(user.trialStartDate);
				saveTrialAvailability(user.trialAvailability);
				this.emit("user-stored", user);
			} else {
				saveTrialAvailability(true);
				await this.updateUser();
			}
		} catch (err) {
			console.log(err);
		}
	};

	public init = async () => {
		const user = loadUserId();
		if (isDev) console.log(user);
		this.emit("init");
	};

	private getIdAndEmail = () => {
		const id = machineIdSync();
		return {
			id,
			email: `${id}@glimmr.com`,
		};
	};
}

export default Auth;

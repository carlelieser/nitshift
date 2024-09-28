import admin from "firebase-admin";
import ora from "ora";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };
import dayjs from "dayjs";
import _ from "lodash";
import Confirm from "prompt-confirm";
import Table from "cli-table";
import update from "immutability-helper";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const spinner = ora({
	prefixText: () => `[${new Date().toLocaleString()}]`
}).start();
const isSilent = process.argv.includes("--silent");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const getUsersOnTrial = async () => {
	const collection = db.collection("users");
	const snapshot = await collection.where("trialStartDate", "!=", null).where("license", "==", "trial").get();
	return snapshot.docs.map((doc) => doc.data());
};

const getUsersWithExpiredTrials = (users) => users.filter((user) => {
	if (!user.trialStartDate) return false;
	const start = dayjs(user.trialStartDate);
	const end = start.add(7, "days");
	return end.isBefore(dayjs());
});

const getDaysSinceTrialStart = (users) => users.map((user) => dayjs().diff(dayjs(user.trialStartDate), "days"));

const revokeTrial = async (user) => {
	const ref = db.collection("users").doc(user.email);
	const updatedUser = update(user, {
		trialStartDate: {
			$set: null
		},
		trialAvailability: {
			$set: false
		},
		license: {
			$set: "free"
		}
	});
	await ref.set(updatedUser);
};

const getStats = async () => {
	const usersOnTrial = await getUsersOnTrial();
	const usersWithExpiredTrials = getUsersWithExpiredTrials(usersOnTrial);
	const daysSinceTrialStart = getDaysSinceTrialStart(usersOnTrial);

	return {
		counts: {
			total: usersOnTrial.length,
			expired: usersWithExpiredTrials.length
		},
		source: usersOnTrial,
		expired: {
			source: usersWithExpiredTrials,
			min: _.min(daysSinceTrialStart),
			max: _.max(daysSinceTrialStart),
			mean: _.mean(daysSinceTrialStart)
		}
	};
};

const displayStats = (stats) => {
	const table = new Table({
		head: ["Total Users", "Expired Trials", "Shortest Trial (Days)", "Longest Trial (Days)"]
	});

	table.push([stats.counts.total, stats.counts.expired, stats.expired.min, stats.expired.max]);

	console.log(table.toString());
};

const revokeTrialForUnauthorizedUsers = async (stats) => {
	await fs.outputFile(path.join(__dirname, "users.json"), JSON.stringify(stats.expired.source));
	const promises = stats.expired.source.map(revokeTrial);
	await Promise.all(promises);
	spinner.succeed(`Successfully revoked trials for ${stats.counts.expired} users.`);
};

// An unauthorized user refers to a user who has exceeded the 7-day trial period.
const runIntegrityCheck = async () => {
	try {
		spinner.info("Fetching user data...");

		const stats = await getStats();

		if (stats.counts.expired) {
			displayStats(stats);

			spinner.fail(`Found ${stats.counts.expired} users with expired trials.`);

			if (isSilent) {
				spinner.start("Revoking expired trials...");
				await revokeTrialForUnauthorizedUsers(stats);
			} else {
				const shouldEnforceExpiredTrials = await new Confirm("Do you want to revoke trials for users with expired access?").run();

				if (shouldEnforceExpiredTrials) {
					spinner.start("Revoking expired trials...");
					await revokeTrialForUnauthorizedUsers(stats);
				}
			}
		} else {
			spinner.succeed("No unauthorized users with expired trials detected.");
		}
	} catch (err) {
		spinner.fail(`An error occurred while processing expired trials:\n${err}`);
	}
};

runIntegrityCheck();
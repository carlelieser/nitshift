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

const spinner = ora().start();

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

const endTrial = async (user) => {
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
	var table = new Table({
		head: ["Total", "Expired", "Min", "Max", "Mean"]
	});

	table.push([stats.counts.total, stats.counts.expired, stats.expired.min, stats.expired.max, stats.expired.mean]);

	console.log(table.toString())
};

const handleExpiredTrials = async () => {
	try {
		spinner.info("Grabbing stats...");

		const stats = await getStats();

		if (stats.counts.expired) {
			displayStats(stats);

			spinner.fail(`${stats.counts.expired} expired trials!`);

			const shouldEnforceExpiredTrials = await new Confirm("Enforce expired trials?").run();

			if (shouldEnforceExpiredTrials) {
				await fs.outputFile(path.join(__dirname, "expired-trials.json"), JSON.stringify(stats.expired.source));
				const promises = stats.expired.source.map((user) => endTrial(user));
				await Promise.all(promises);
				spinner.succeed(`Ended trials for ${stats.counts.expired} users`);
			}
		} else {
			spinner.succeed("No users with expired trials!");
		}
	} catch (err) {
		spinner.fail(`Failed to handle expired trials:\n${err}`);
	}
};

handleExpiredTrials();
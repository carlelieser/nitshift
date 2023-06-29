import fs from "fs";
import path from "path";
import ora from "ora";
import fetch from "node-fetch";
import { ACCESS_TOKEN, Release } from "../src/main/updater";
import * as console from "console";
import * as process from "process";
import config from "../package.json";
import * as ProgressBar from "cli-progress";
import ghReleaseAssets = require("gh-release-assets");
import Confirm = require("prompt-confirm");
import logSymbols = require("log-symbols");
import * as emoji from "node-emoji";
import release from "../src/common/release.json";

const auto = process.argv.includes("--auto");

const assetPath = path.join(__dirname, "..", "out", "make", "squirrel.windows", "x64", "glimmr-setup.exe");

const seeYa = () => console.log(emoji.get("wave"), "Well, alrighty then.");

const quit = (spinner: ora.Ora, message: string) => {
	spinner.stop();
	console.log(logSymbols.error, message);
	process.exit();
};

const createRelease = (repo: string): Promise<Release> => {
	const spinner = ora(`${repo}: creating release`).start();
	return fetch(`https://api.github.com/repos/${repo}/releases`, {
		method: "POST",
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${ACCESS_TOKEN}`,
			"X-GitHub-Api-Version": "2022-11-28",
		},
		body: JSON.stringify({
			...release,
			name: `Release ${release.tag_name}`,
			draft: true,
			prerelease: false,
			generate_release_notes: false,
		}),
	})
		.then((response) => {
			return response.json();
		})
		.catch((err) => {
			console.log(err);
			quit(spinner, `${repo}: failed`);
		})
		.finally(() => {
			spinner.stop();
			console.log(logSymbols.success, `${repo}: release created`);
		});
};

const publishRelease = (repo: string, releaseId: number) => {
	const spinner = ora(`${repo}: ${releaseId}: publishing release`).start();
	return fetch(`https://api.github.com/repos/${repo}/releases/${releaseId}`, {
		method: "PATCH",
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${ACCESS_TOKEN}`,
			"X-GitHub-Api-Version": "2022-11-28",
		},
		body: JSON.stringify({
			draft: false,
		}),
	})
		.then((response) => response.json())
		.catch((err) => {
			quit(spinner, `${repo}: ${releaseId} failed`);
		})
		.finally(() => {
			spinner.stop();
			console.log(logSymbols.success, `${repo}: ${releaseId} release published`);
			process.exit();
		});
};

const uploadAsset = (repo: string, releaseId: number) => {
	return new Promise<void>((resolve) => {
		console.log(logSymbols.info, `Uploading asset to release: ${releaseId}`);
		const size = fs.statSync(assetPath).size;
		const bar = new ProgressBar.SingleBar({}, ProgressBar.Presets.shades_classic);
		bar.start(size, 0);
		const result = ghReleaseAssets(
			{
				url: `https://uploads.github.com/repos/${repo}/releases/${releaseId}/assets`,
				token: ACCESS_TOKEN,
				assets: [
					{
						name: `glimmr-${config.version}-setup.exe`,
						path: assetPath,
					},
				],
			},
			(err: any, assets: any) => {
				bar.stop();
				console.log(logSymbols.success, "asset uploaded");
				resolve();
			}
		);
		result.on("upload-progress", (name: string, status: any) => {
			bar.update(status.transferred);
		});
	});
};

const upload = async (repo: string) => {
	const shouldCreateRelease = auto ? true : await new Confirm(`${repo}: create release?`).run();
	if (shouldCreateRelease) {
		const release = await createRelease(repo);
		const shouldUpload = auto ? true : await new Confirm(`${repo}: start asset upload?`).run();

		if (shouldUpload) {
			await uploadAsset(repo, release.id);
			const shouldPublish = auto ? true : await new Confirm(`${repo}: publish release?`).run();
			if (shouldPublish) await publishRelease(repo, release.id);
		}
	}

	seeYa();
};

const run = async () => {
	await upload("carlelieser/glimmr");
	await upload("carlelieser/glimmr-release");
};

run();

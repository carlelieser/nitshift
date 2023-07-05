import fs from "fs";
import path from "path";
import ora from "ora";
import fetch from "node-fetch";
import { ACCESS_TOKEN, Release } from "../src/main/updater";
import * as console from "console";
import * as process from "process";
import config from "../package.json";
import * as ProgressBar from "cli-progress";
import ghReleaseAssets from "gh-release-assets";
import Confirm from "prompt-confirm";
import * as logSymbols from "log-symbols";
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

const getPreviousReleaseWithSameTag = (repo: string): Promise<any> => {
	const spinner = ora(`${repo}: finding existing release for ${release.tag_name}`).start();

	return fetch(`https://api.github.com/repos/${repo}/releases/tags/${release.tag_name}`, {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${ACCESS_TOKEN}`,
			"X-GitHub-Api-Version": "2022-11-28",
		},
	}).then((response) => {
		const succeeded = response.status === 200;
		spinner.stop();

		if (succeeded) console.log(logSymbols.info, `${release.tag_name} release found`);
		else console.log(logSymbols.info, `no release found`);

		return succeeded ? response.json() : false;
	});
};

const removePreviousReleaseWithSameTag = async (repo: string): Promise<boolean> => {
	const prevRelease = await getPreviousReleaseWithSameTag(repo);

	if (prevRelease) {
		const spinner = ora(`${repo}: removing ${release.tag_name} release`).start();

		return fetch(`https://api.github.com/repos/${repo}/releases/${prevRelease.id}`, {
			method: "DELETE",
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${ACCESS_TOKEN}`,
				"X-GitHub-Api-Version": "2022-11-28",
			},
		}).then(() => {
			spinner.stop();
			console.log(logSymbols.success, `${repo}: ${prevRelease.tag_name} release removed`);
			return true;
		});
	}

	return new Promise<boolean>((resolve) => {
		resolve(false);
	});
};

const createRelease = async (repo: string): Promise<Release> => {
	await removePreviousReleaseWithSameTag(repo);

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
			draft: false,
			prerelease: true,
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
			console.log(logSymbols.success, `${repo}: new release created`);
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
			prerelease: false,
		}),
	})
		.then((response) => response.json())
		.catch((err) => {
			quit(spinner, `${repo}: ${releaseId} failed`);
		})
		.finally(() => {
			spinner.stop();
			console.log(logSymbols.success, `${repo}: ${releaseId} release published`);
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
	process.exit();
};

run();

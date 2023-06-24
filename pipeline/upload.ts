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

const assetPath = path.join(__dirname, "..", "out", "make", "squirrel.windows", "x64", "glimmr-setup.exe");

const seeYa = () => console.log(emoji.get("wave"), "Well, alrighty then.");

const quit = (spinner: ora.Ora, message: string) => {
	spinner.stop();
	console.log(logSymbols.error, message);
	process.exit();
};

const createRelease = (): Promise<Release> => {
	const spinner = ora("Creating release").start();
	return fetch("https://api.github.com/repos/carlelieser/glimmr/releases", {
		method: "POST",
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${ACCESS_TOKEN}`,
			"X-GitHub-Api-Version": "2022-11-28",
		},
		body: JSON.stringify({
			...release,
			target_commitish: "main",
			name: `Release ${release.tag_name}`,
			draft: true,
			prerelease: false,
			generate_release_notes: false,
		}),
	})
		.then((response) => response.json())
		.catch((err) => {
			quit(
				spinner,
				`Failed to create release:
 ${err}`
			);
		})
		.finally(() => {
			spinner.stop();
			console.log(logSymbols.success, "Release created");
		});
};

const publishRelease = (releaseId: number) => {
	const spinner = ora("Publishing release").start();
	return fetch(`https://api.github.com/repos/carlelieser/glimmr/releases/${releaseId}`, {
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
			quit(spinner, `Failed to publish release:\n ${err}`);
		})
		.finally(() => {
			spinner.stop();
			console.log(logSymbols.success, "Release published");
			process.exit();
		});
};

const uploadAsset = (releaseId: number) => {
	return new Promise<void>((resolve) => {
		console.log(logSymbols.info, `Uploading asset to release: ${releaseId}`);
		const size = fs.statSync(assetPath).size;
		const bar = new ProgressBar.SingleBar({}, ProgressBar.Presets.shades_classic);
		bar.start(size, 0);
		const result = ghReleaseAssets(
			{
				url: `https://uploads.github.com/repos/carlelieser/glimmr/releases/${releaseId}/assets`,
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
				console.log(logSymbols.success, "Asset uploaded");
				resolve();
			}
		);
		result.on("upload-progress", (name: string, status: any) => {
			bar.update(status.transferred);
		});
	});
};

const upload = async () => {
	const shouldCreateRelease = await new Confirm("Create release?").run();

	if (shouldCreateRelease) {
		const release = await createRelease();
		const shouldUpload = await new Confirm("Start asset upload?").run();

		if (shouldUpload) {
			await uploadAsset(release.id);
			const shouldPublish = await new Confirm("Publish release?").run();
			if (shouldPublish) await publishRelease(release.id);
		}
	}

	seeYa();
};

upload();

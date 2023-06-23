async function main() {
	const fs = (await import("fs")).default;
	const path = await import("path");
	const configModule = await import("./package.json");
	const config = configModule.default;
	const ora = (await import("ora")).default;
	const logSymbols = (await import("log-symbols")).default;
	const fetch = (await import("node-fetch")).default;
	const updaterModule = await import("./src/main/updater");
	const ACCESS_TOKEN = updaterModule.ACCESS_TOKEN;
	const console = await import("console");
	const process = await import("process");
	// @ts-ignore
	const ghReleaseAssets = (await import("gh-release-assets")).default;
	// @ts-ignore
	const ProgressBar = (await import("cli-progress")).default;
	//@ts-ignore
	const Confirm = (await import("prompt-confirm")).default;

	const version = config.version;

	const assetPath = path.join(__dirname, "out", "make", "squirrel.windows", "x64", "glimmer-setup.exe");

	const message = process.argv.find((arg) => arg.includes("--message"))?.split("=")?.[1];

	if (!message) {
		console.log(logSymbols.error, "Please provide a description of the release");
		process.exit();
	}

	const createRelease = (): any => {
		const spinner = ora("Creating release").start();
		return fetch("https://api.github.com/repos/carlelieser/glimmr/releases", {
			method: "POST",
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${ACCESS_TOKEN}`,
				"X-GitHub-Api-Version": "2022-11-28",
			},
			body: JSON.stringify({
				tag_name: `v${version}`,
				target_commitish: "main",
				name: `Release v${version}`,
				body: message,
				draft: true,
				prerelease: false,
				generate_release_notes: false,
			}),
		})
			.then((response) => response.json())
			.catch((err) => {
				if (err) {
					spinner.stop();
					console.log(logSymbols.error, "Failed to create release");
					process.exit();
				}
			})
			.finally(() => {
				spinner.stop();
				console.log(logSymbols.success, "Release created");
			});
	};

	const publishRelease = (releaseId: string) => {
		const spinner = ora("Updating release").start();
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
				if (err) {
					spinner.stop();
					console.log(logSymbols.error, "Failed to update release");
					process.exit();
				}
			})
			.finally(() => {
				spinner.stop();
				console.log(logSymbols.success, "Release updated");
			});
	};

	const uploadAsset = (releaseId: string) => {
		return new Promise<void>((resolve) => {
			console.log(logSymbols.info, "Uploading asset");
			const size = fs.statSync(assetPath).size;
			const bar = new ProgressBar.SingleBar({}, ProgressBar.Presets.shades_classic);
			bar.start(size, 0);
			const result = ghReleaseAssets(
				{
					url: `https://uploads.github.com/repos/carlelieser/glimmr/releases/${releaseId}/assets`,
					token: ACCESS_TOKEN,
					assets: [
						{
							name: `glimmr-${version}-setup.exe`,
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
		const release = await createRelease();
		const shouldUpload = await new Confirm("Upload setup file?").run();

		if (shouldUpload) {
			await uploadAsset(release.id);
			const shouldPublish = await new Confirm("Publish release? This will make the release available to users.").run();
			if (shouldPublish) await publishRelease(release.id);
		} else {
			console.log(logSymbols.error, "Exiting");
		}
	};

	await upload();
}

main();

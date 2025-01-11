import { Octokit } from "octokit";
import * as keys from "../src/main/keys.ts";
import fetch from "node-fetch";
import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { Extract } from "unzip-stream";
import ora from "ora";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isWindows = process.platform === "win32";

const spinner = ora();
const target = path.join(__dirname, "..", "code-sign-tool");
const octokit = new Octokit({
	auth: keys.git
});

spinner.start();

spinner.info(`Cleaning directory: ${target}`);

await fs.emptyDir(target);

spinner.info("Getting latest release asset from GitHub...");

const release = await octokit.rest.repos.getLatestRelease({
	owner: "SSLcom",
	repo: "CodeSignTool"
});

const asset = release.data.assets.find(asset => asset.name === `CodeSignTool-${release.data.tag_name}${isWindows ? "-windows" : ""}.zip`);

spinner.succeed(`Found: ${asset.browser_download_url}`);

const response = await fetch(asset.browser_download_url);

spinner.start("Downloading and extracting zip...");

response.body.pipe(Extract({ path: target })).on("finish", () => spinner.succeed(`CodeSignTool updated to ${release.data.tag_name}!`));

import release from "../src/common/release.json";
import config from "../package.json";
import * as emoji from "node-emoji";
import ora from "ora";

import * as logSymbols from "log-symbols";

const { NodeSSH } = require("node-ssh");
const client = new NodeSSH();

const spinner = ora("Connecting to server").start();
const exe = `glimmr-${config.version}-setup.exe`;
const url = `https://github.com/carlelieser/glimmr-release/releases/download/${release.tag_name}/${exe}`;

client
	.connect({
		host: "66.29.156.2",
		username: "root",
		password: "$Olrock5567",
	})
	.then(() => {
		spinner.stop();
		console.log(logSymbols.success, "Connected");
		spinner.start("Creating directory");
		return client.execCommand("mkdir glimmr-release", { cwd: "/home" });
	})
	.then(() => {
		spinner.stop();
		console.log(logSymbols.success, "Directory created");
		spinner.start("Removing previous setup file");
		return client.execCommand(`rm -rf ./${exe}`, { cwd: "/home/glimmr-release" });
	})
	.then(() => {
		spinner.stop();
		console.log(logSymbols.success, "Setup file removed");
		spinner.start(`Downloading new setup file at: ${url}`);
		return client.execCommand(`wget ${url}`, { cwd: "/home/glimmr-release" });
	})
	.then(() => {
		spinner.stop();
		console.log(logSymbols.success, "Setup file downloaded successfully");
		console.log("\n\n");
		console.log(logSymbols.info, `File available at: https://glimmr.app/releases/${exe}`);
	})
	.catch((err) => {
		spinner.stop();
		console.log(logSymbols.error, `Error: ${err}`);
	})
	.finally(() => {
		console.log(emoji.get("wave"), "Exiting");
		client.dispose();
	});

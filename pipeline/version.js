const fs = require("node:fs");
const path = require("node:path");
const ora = require("ora");
const console = require("console");
const process = require("node:process");
const config = require("../package.json");
const prettier = require("prettier");
const logSymbols = require("log-symbols");
const release = require("../release.json");
const { randomUUID } = require("crypto");

const shouldIncrement = process.argv.includes("--increment");

const current = config.version;
const versionNumber = Number("0." + current.split(".").join(""));
const target = (shouldIncrement ? versionNumber + 0.001 : versionNumber - 0.001).toFixed(3);
const version = target.toString().split(".")[1].split("").join(".");

console.log(logSymbols.info, `Updating version from ${current} to ${version}`);

const spinner = ora("Applying changes").start();

config.version = version;
release.tag_name = `v${version}`;

const format = (object) =>
	prettier.format(JSON.stringify(object), {
		singleAttributePerLine: true,
		trailingComma: "none",
		quoteProps: "preserve",
		parser: "json5",
	});

fs.writeFileSync(path.join(__dirname, "..", "package.json"), format(config), { encoding: "utf-8" });

fs.writeFileSync(path.join(__dirname, "..", "src", "common", "release.json"), format(release), {
	encoding: "utf-8",
});

fs.writeFileSync(path.join(__dirname, "..", "release.json"), format(release), {
	encoding: "utf-8",
});

spinner.stopAndPersist({
	symbol: logSymbols.success,
	text: "Version update successful",
});

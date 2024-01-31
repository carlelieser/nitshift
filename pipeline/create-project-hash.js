const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const ProjectHasher = require("./hasher");

const hasher = new ProjectHasher({
	root: path.resolve(__dirname, "..", "dist", "win-unpacked", "resources", "app.asar"),
	asar: true,
});

hasher.hash(true).then(id => fs.writeFileSync(path.join(__dirname, "..", "src", "main", "safe.ts"), `export const safe = "${id}";`));

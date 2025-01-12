import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const access = process.argv[2] ?? "default";
const rootPath = path.join(__dirname, "..");
const keyPath = path.join(rootPath, "src", "main", "keys.ts");
const keyContent = await fs.readFile(keyPath, "utf8");
const keyContentLines = keyContent.split("\n");
const baseContentLines = keyContentLines.slice(0, keyContentLines.findIndex((line) => line.includes("export const access")));
const baseContent = baseContentLines.join("\n");
const newKeyContent = `${baseContent}\nexport const access = [${access.split(/[^a-zA-Z0-9]/g).map(id => `"${id}"`).join(", ")}];\n`;

await fs.outputFile(keyPath, newKeyContent);
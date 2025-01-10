const path = require("node:path");
const fs = require("node:fs");
const { kebabCase, uniq, pick, identity } = require("lodash");
const prettier = require("prettier");

const root = path.join(__dirname, "..", "..", "..");

const paths = {
	prettier: path.join(root, ".prettierrc"),
	rendererTemplate: path.join(__dirname, "templates", "renderer.txt"),
	mainTemplate: path.join(__dirname, "templates", "main.txt"),
	storage: path.join(root, "src", "main", "storage.ts"),
	rendererStorage: path.join(root, "src", "renderer", "storage.ts"),
	mainStorage: path.join(root, "src", "main", "messages", "storage.ts"),
};

const config = JSON.parse(fs.readFileSync(paths.prettier, { encoding: "utf-8" }));
const rendererTemplate = fs.readFileSync(paths.rendererTemplate, { encoding: "utf-8" });
const mainTemplate = fs.readFileSync(paths.mainTemplate, { encoding: "utf-8" });

const parseMethod = (method) => {
	if (!method) return null;

	const name = method.match(/(?<=const ).+(?= = \()/g).shift();
	const data = method
		.split("=>")
		.shift()
		.match(/(?<=\().+(?=\))/g)
		?.shift();


	if (!data) return { originalName: name, name: kebabCase(name), params: [], paramString: "" };

	const params = data.split(",").map((param) => param.trim());
	const paramNames = params.map((param) => param.split(":").shift());

	return {
		originalName: name,
		name: kebabCase(name),
		params: paramNames,
		paramString: paramNames.join(", "),
	};
};

const replaceMethodReturnValue = (method, value) => method.replace(/=>.+/g, "=> " + value);

const getEventName = (name) => `storage/${name}`;

const getIpcParams = (args) => [...args].join(",");

const convert = (method, callback) => {
	const parsed = parseMethod(method);

	if (!parsed) return;

	const event = getEventName(parsed.name);

	return callback({ parsed, event });
};

const convertMethodToIpcRenderer = (method) => {
	return convert(method, ({ parsed, event }) => {
		const args = getIpcParams([`"${event}"`, ...parsed.params]);
		const result = `ipcRenderer.sendSync(${args})`;
		return replaceMethodReturnValue(method, result);
	});
};

const convertMethodToIpcMain = (method) => {
	return convert(method, ({ parsed, event }) => {
		const args = getIpcParams(["e", ...parsed.params]);
		let methodCall = `storage.${parsed.originalName}(${parsed.paramString})`;

		if (parsed.originalName === "loadLicense") {
			methodCall = `loadGenuineLicense()`;
		}

		if (parsed.originalName === "saveLicense") {
			methodCall = `storage.${parsed.originalName}(loadGenuineLicense())`;
		}

		return `ipcMain.on("${event}", (${args}) => { e.returnValue = ${methodCall}; })`;
	});
};

const output = (path, conversion = "main") => {
	const method = conversion === "main" ? convertMethodToIpcMain : convertMethodToIpcRenderer;
	const template = conversion === "main" ? mainTemplate : rendererTemplate;
	const converted = methods.map(method).filter(method => method);
	const content = template.replace("{{{replacement}}}", converted.join("\n"));
	const formatted = prettier.format(content, config);
	fs.writeFileSync(path, formatted);
};

const data = fs.readFileSync(paths.storage, { encoding: "utf-8" });
const content = data.split("\n");
const lines = content.slice(
	content.findIndex((line) => line.includes("// [storage][start]")) + 1,
	content.findIndex((line) => line.includes("// [storage][end]")),
);
const methods = lines.join("").split(";");

output(paths.mainStorage, "main");
output(paths.rendererStorage, "renderer");

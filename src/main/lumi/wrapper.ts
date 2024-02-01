import { Monitor } from "lumi-control";
import path from "node:path";
import { utilityProcess } from "electron";

const modulePath = path.resolve(__dirname, "module.js");

const executeAndWaitForResponse = <T>(name: string, args: Array<any>, defaultValue: any) => {
	return new Promise<T>((resolve) => {
		const thread = utilityProcess.fork(modulePath);

		thread.on("message", ({ method, response }) => {
			if (method === name) {
				if (response.error) resolve(defaultValue);
				else resolve(response.result);
				thread.kill();
			}
		});

		thread.postMessage({
			method: name,
			args
		});
	});
};

export const monitors = () => executeAndWaitForResponse<Array<Monitor>>("monitors", [], []);

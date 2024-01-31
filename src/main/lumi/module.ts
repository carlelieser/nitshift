import lumi from "lumi-control";
import process from "node:process";

const execute = async (name: string, args: Array<string>) => {
	try {
		const promiseOrResult = lumi[name](...args);
		const result = await promiseOrResult;
		return {
			result,
		};
	} catch (err) {
		console.log({
			message: `Error executing "${name}" with ${args} in lumi module:`,
			err,
		});
		return {
			result: null,
			error: true,
		};
	}
};

process.parentPort.once("message", ({ data: { method, args } }) => {
	execute(method, args).then((response) => {
		process.parentPort.postMessage({
			method,
			response,
		});
	});
});

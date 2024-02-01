import fs from "fs";

export interface TransferStatus {
	percentage: number;
	transferred: number;
	length: number;
	remaining: number;
}

export interface DownloadWorkerEvent {
	event: "progress" | "finished";
	data?: TransferStatus;
}

const download = async (
	url: string,
	path: string,
	options: RequestInit = {},
	onProgress: (status: TransferStatus) => void,
	onFinished: () => void
) => {
	try {
		const response = await fetch(url, options);
		const reader = response.body.getReader();
		const output = fs.createWriteStream(path, { flags: "a" });
		const bytesToDownload = Number(response.headers.get("content-length"));

		if (fs.existsSync(path)) fs.rmSync(path, { force: true });

		let done = false;

		while (!done) {
			const result = await reader.read();
			if (result.value) {
				await new Promise((resolve) => output.write(result.value, resolve));
			}
			onProgress({
				percentage: (output.bytesWritten / bytesToDownload) * 100,
				transferred: output.bytesWritten,
				remaining: bytesToDownload - output.bytesWritten,
				length: bytesToDownload
			});
			done = result.done;
		}

		reader.releaseLock();
		await response.body.cancel();
		await new Promise((resolve) => output.close(resolve));
		await new Promise((resolve) => output.end(resolve));

		onFinished();
	} catch (err) {
		console.log(err);
	}
};

self.addEventListener("message", (e) => {
	download(
		e.data.url,
		e.data.path,
		e.data.options,
		(status) => {
			self.postMessage({
				event: "progress",
				data: status
			});
		},
		() =>
			self.postMessage({
				event: "finished"
			})
	);
});

export default null as any;

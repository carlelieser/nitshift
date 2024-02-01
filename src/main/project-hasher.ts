import path from "node:path";
import fg from "fast-glob";
import PQueue from "p-queue";
import fs from "node:fs";
import crypto from "node:crypto";
import asar from "@electron/asar";
import { sortBy } from "lodash";
import release from "@common/release.json";

class ProjectHasher {
	private readonly config = {
		root: path.join(__dirname, "..", "renderer"),
		files: "**/*",
		asar: false
	};

	private queue = new PQueue({
		concurrency: 3
	});

	constructor(config = {}) {
		this.config = {
			...this.config,
			...config
		};
	}

	public runAsarHash = (useVersion: boolean) => {
		const ext = ".asar";
		const packagePath = this.config.root.slice(0, this.config.root.lastIndexOf(ext) + ext.length);
		return this.extractAsarFiles(packagePath, useVersion);
	};

	public runStandardHash = async (useVersion: boolean) => {
		const hashes = await this.build();
		return this.getCompositeHash(hashes, useVersion);
	};

	public hash = async (useVersion: boolean = true) => this.runHash(useVersion);

	public getHashFromString = (string: string) => {
		return crypto.createHash("sha256").update(string, "utf-8").digest("hex");
	};

	private runHash = (useVersion: boolean) => {
		if (this.config.asar) return this.runAsarHash(useVersion);
		return this.runStandardHash(useVersion);
	};

	private getCompositeHash = (hashes: Array<string>, useVersion: boolean = true) => {
		const sortedHashes = sortBy(hashes).join("");
		const suffix = useVersion ? release.tag_name : "";
		return this.getHashFromString(sortedHashes + suffix);
	};

	private getAsarFileHashes = (files: Record<string, asar.DirectoryRecord | asar.FileRecord>) => {
		let result = [];

		for (const value of Object.values(files)) {
			if (typeof value !== "object") return;

			if ("integrity" in value) {
				result.push(value.integrity.hash);
			} else {
				result = [
					...result,
					...this.getAsarFileHashes(
						value as unknown as Record<string, asar.DirectoryRecord | asar.FileRecord>
					)
				];
			}
		}

		return result;
	};

	private extractAsarFiles = (path: string, useVersion: boolean) => {
		const files = (asar.getRawHeader(path) as Record<string, any>).header.files.out.files.renderer;
		const hashes = this.getAsarFileHashes(files);
		return this.getCompositeHash(hashes, useVersion);
	};

	private build = async () => {
		const files = await fg(this.config.files, { cwd: this.config.root });

		this.queue.clear();

		return await this.queue.addAll(
			files.map((file) => () => this.contentHash(path.resolve(this.config.root, file)))
		);
	};

	private contentHash = (path: string): Promise<string> => {
		return new Promise((resolve) => {
			const stream = fs.createReadStream(path);
			const hash = crypto.createHash("sha256");

			stream
				.pipe(hash)
				.setEncoding("hex")
				.on("finish", () => {
					resolve(hash.digest("hex"));
				});
		});
	};
}

export default ProjectHasher;

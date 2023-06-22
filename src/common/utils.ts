import * as fs from "fs";

export const isDev = process.env.NODE_ENV === "development";
export const normalizeBrightness = (brightness: number, globalBrightness: number) =>
	Math.round((brightness * (globalBrightness / 100) + Number.EPSILON) * 100) / 100;

export const mkdir = (path: string) => new Promise((resolve) => fs.mkdir(path, resolve));

export const VERSION_TAG = "v0.0.2";

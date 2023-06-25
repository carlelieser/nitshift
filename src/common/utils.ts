import * as fs from "fs";

export const isDev = process.env.NODE_ENV === "development";
export const normalizeBrightness = (brightness: number, globalBrightness: number) =>
	Math.round((brightness * (globalBrightness / 100) + Number.EPSILON) * 100) / 100;

export const isNumberAroundReference = (target: number, reference: number, tolerance: number): boolean => {
	return Math.abs(target - reference) <= tolerance;
};

export const removeDirectory = (path: string) => new Promise((resolve) => fs.rmdir(path, { recursive: true }, resolve));
export const createDirectory = (path: string) => new Promise((resolve) => fs.mkdir(path, resolve));

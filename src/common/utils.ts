import fs from "fs";
import { randomUUID } from "node:crypto";
import { Appearance, AppState } from "./types";

export const isDev = process.env.NODE_ENV === "development";

export const normalizeBrightness = (brightness: number, globalBrightness: number) =>
	Math.round((brightness * (globalBrightness / 100) + Number.EPSILON) * 100) / 100;

export const isNumberAroundReference = (target: number, reference: number, tolerance: number): boolean => {
	return Math.abs(target - reference) <= tolerance;
};

export const removeDirectory = (path: string) => new Promise((resolve) => fs.rm(path, { recursive: true }, resolve));
export const createDirectory = (path: string) => new Promise((resolve) => fs.mkdir(path, resolve));

export const createDefaultBrightnessMode = (
	label: string,
	icon: string,
	brightness: number,
	active: boolean = false
) => {
	return {
		id: randomUUID(),
		removable: false,
		label,
		icon,
		brightness,
		active
	};
};

export const appearances: Array<Appearance> = ["auto", "light", "dark"];

export const modes: Array<AppState["mode"]> = ["compact", "expanded"];

export const dimensions = {
	expanded: {
		native: {
			width: 400,
			height: 450
		},
		default: {
			width: 400,
			height: 450
		}
	},
	compact: {
		native: {
			width: 520,
			height: 220
		},
		default: {
			width: 520,
			height: 220
		}
	},
	padding: 4
};

export const scheduleTypes = {
	manual: "Manual",
	dawn: "Dawn",
	dusk: "Dusk",
	goldenHour: "Golden Hour",
	goldenHourEnd: "Golden Hour End",
	nadir: "Nadir",
	nauticalDawn: "Nautical Dawn",
	nauticalDusk: "Nautical Dusk",
	night: "Night",
	nightEnd: "Night End",
	solarNoon: "Solar Noon",
	sunrise: "Sunrise",
	sunriseEnd: "Sunrise End",
	sunset: "Sunset",
	sunsetStart: "Sunset Start"
};

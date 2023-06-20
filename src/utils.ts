export const isDev = process.env.NODE_ENV === "development";
export const normalizeBrightness = (brightness: number, globalBrightness: number) =>
	Math.round((brightness * (globalBrightness / 100) + Number.EPSILON) * 100) / 100;

export const VERSION = "0.0.1";

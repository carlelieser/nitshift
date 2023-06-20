import { Monitor } from "lumi-control";

export type BrightnessMode = "native" | "shade";

export interface UIMonitor extends Monitor {
	brightness: number;
	mode: BrightnessMode;
	disabled: boolean;
}

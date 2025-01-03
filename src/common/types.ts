import { Monitor } from "lumi-control";

export type BrightnessMode = "native" | "shade";

export interface Asset {
	url: string;
	id: number;
	node_id: string;
	name: string;
	label: string;
	content_type: string;
	state: string;
	size: number;
	created_at: Date;
	updated_at: Date;
	browser_download_url: string;
}

export interface Release {
	url: string;
	assets_url: string;
	upload_url: string;
	html_url: string;
	id: number;
	node_id: string;
	tag_name: string;
	target_commitish: string;
	name: string;
	draft: boolean;
	prerelease: boolean;
	created_at: Date;
	published_at: Date;
	assets: Array<Asset>;
	body: string;
}

export interface UIMonitor extends Monitor {
	nickname: string;
	brightness: number;
	mode: BrightnessMode;
	disabled: boolean;
	connected: boolean;
}

export interface ScheduleItemContent {
	monitors: Array<UIMonitor>;
	time: string;
	brightness: number;
}

export interface ScheduleItem extends ScheduleItemContent {
	id: string;
}

export interface BrightnessModeData {
	id?: string;
	label: string;
	active: boolean;
	brightness: number;
	icon: string;
	removable: boolean;
}

export type Appearance = "auto" | "light" | "dark";

export interface StartupSettings {
	mode: AppState["mode"];
	auto: boolean;
	silent: boolean;
}

export interface AppState {
	activeMonitor: UIMonitor | null;
	appearance: Appearance;
	syncAppearance: boolean;
	autoUpdateCheck: boolean;
	brightness: number;
	brightnessModes: Array<BrightnessModeData>;
	license: "free" | "trial" | "premium";
	mode: "expanded" | "compact";
	monitors: Array<UIMonitor>;
	monitorNicknames: Array<[string, string]>;
	receivedPremium: boolean;
	refreshed: boolean;
	schedule: Array<ScheduleItem>;
	trialAvailability: boolean;
	trialStartDate: number | null;
	transitioning: boolean;
	userId: string | null;
	userEmail: string | null;
	focused: boolean;
	release: Release;
	startup: StartupSettings;
	minShadeLevel: number;
	maxShadeLevel: number;

	[key: string]: any;
}

export const GLOBAL = "GLOBAL";

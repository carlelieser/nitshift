import { screen } from "electron";
import { debounce } from "lodash";
import { loadMonitors } from "@main/storage";
import EventEmitter from "events";

interface DisplayHandlerDeps {
	refreshMonitors: () => Promise<any[]>;
	destroyShade: (id: string) => void;
	destroyAllShades: () => void;
	applyBrightness: () => void;
	readjustWindow: () => void;
}

const REFRESH_DEBOUNCE = 250;

export class DisplayHandler extends EventEmitter {
	private deps: DisplayHandlerDeps;

	constructor(deps: DisplayHandlerDeps) {
		super();
		this.deps = deps;
	}

	public start() {
		screen.on("display-metrics-changed", this.handleDisplayMetricsChanged);
		screen.on("display-added", this.handleDisplayAdded);
		screen.on("display-removed", this.handleDisplayRemoved);
	}

	public stop() {
		screen.off("display-metrics-changed", this.handleDisplayMetricsChanged);
		screen.off("display-added", this.handleDisplayAdded);
		screen.off("display-removed", this.handleDisplayRemoved);
	}

	private refresh = async () => {
		await this.deps.refreshMonitors();
		this.deps.readjustWindow();
	};

	private smartApply = async () => {
		await this.refresh();
		this.deps.applyBrightness();
	};

	private handleDisplayRemoved = debounce(async () => {
		const oldMonitors = loadMonitors().filter(({ connected }) => connected);
		const newMonitors = await this.deps.refreshMonitors();
		const newlyConnectedMonitors = newMonitors.filter(({ connected }) => connected);
		const removedMonitors = oldMonitors.filter(
			(oldMonitor) => !newlyConnectedMonitors.find((monitor) => monitor.id === oldMonitor.id)
		);
		removedMonitors.forEach((monitor) => this.deps.destroyShade(monitor.id));
		await this.smartApply();
	}, REFRESH_DEBOUNCE);

	private handleDisplayMetricsChanged = debounce(async () => {
		this.deps.destroyAllShades();
		await this.smartApply();
	}, REFRESH_DEBOUNCE);

	private handleDisplayAdded = debounce(async () => {
		await this.smartApply();
	}, REFRESH_DEBOUNCE);
}

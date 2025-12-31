import { screen } from "electron";
import { clamp, merge, pick, uniqBy } from "lodash";
import { UIMonitor } from "@common/types";
import { loadMonitorNicknames, loadMonitors, saveMonitors } from "@main/storage";
import * as lumiWrapper from "../lumi/wrapper";

// Default monitor structure
const DEFAULT_MONITOR: UIMonitor = {
	brightness: 100,
	connected: false,
	disabled: false,
	displayId: "",
	id: "",
	internal: false,
	manufacturer: "",
	mode: "native",
	name: "",
	nickname: "",
	position: { x: 0, y: 0 },
	productCode: "",
	serialNumber: "",
	size: { width: 0, height: 0 }
};

export class MonitorService {
	/**
	 * Refreshes the list of monitors by merging stored, available, and screen data.
	 * Returns the unique list of monitors after saving to storage.
	 */
	public async refresh(): Promise<UIMonitor[]> {
		const storedMonitors = loadMonitors();
		const storedMonitorNicknames = loadMonitorNicknames();
		const availableMonitors = await lumiWrapper.monitors();
		const screens = screen.getAllDisplays();

		// Combine stored and available monitors
		const monitors: Array<UIMonitor | any> = [...storedMonitors, ...availableMonitors];

		// Reconcile each monitor with stored, connected, and screen data
		monitors.forEach((monitor, index) => {
			const reconciled = this.reconcileMonitor(
				monitor,
				storedMonitors,
				storedMonitorNicknames,
				availableMonitors,
				screens
			);
			monitors[index] = reconciled;
		});

		const uniqueMonitors = uniqBy(monitors, "id") as Array<UIMonitor>;
		saveMonitors(uniqueMonitors);

		return uniqueMonitors;
	}

	/**
	 * Reconciles a single monitor with all available data sources.
	 */
	private reconcileMonitor(
		monitor: UIMonitor | any,
		storedMonitors: UIMonitor[],
		storedMonitorNicknames: Array<[string, string]>,
		availableMonitors: any[],
		screens: Electron.Display[]
	): UIMonitor {
		// Find matching data from each source
		const nickname = this.findNickname(monitor.id, storedMonitorNicknames);
		const storedMonitor = storedMonitors.find((m) => m.id === monitor.id);
		const connectedMonitor = availableMonitors.find(({ id }) => id === monitor.id);

		// Determine connection status
		const isConnected = this.isMonitorConnected(connectedMonitor);

		// Get brightness (clamped)
		const brightness = clamp(storedMonitor?.brightness ?? 100, 0, 100);

		// Merge monitor data in priority order
		const idealMonitor = merge({}, monitor, storedMonitor, connectedMonitor);

		// Get screen dimensions
		const screenDimensions = this.getScreenDimensions(connectedMonitor, screens);

		// Build final monitor object
		return merge({}, DEFAULT_MONITOR, idealMonitor, screenDimensions, {
			connected: isConnected,
			nickname,
			brightness
		});
	}

	/**
	 * Finds the nickname for a monitor from stored nicknames.
	 */
	private findNickname(monitorId: string, nicknames: Array<[string, string]>): string {
		return nicknames.find(([id]) => id === monitorId)?.[1] ?? "Monitor";
	}

	/**
	 * Determines if a monitor is connected based on its dimensions.
	 */
	private isMonitorConnected(connectedMonitor: any | undefined): boolean {
		return Boolean(
			connectedMonitor &&
			connectedMonitor?.size?.width > 0 &&
			connectedMonitor?.size?.height > 0
		);
	}

	/**
	 * Gets screen dimensions from Electron display data.
	 */
	private getScreenDimensions(
		connectedMonitor: any | undefined,
		screens: Electron.Display[]
	): { size?: any; position?: any } {
		if (!connectedMonitor) return {};

		const screenDisplay = screens.find(({ id }) => id === Number(connectedMonitor?.displayId));
		if (!screenDisplay) return {};

		return merge(
			{},
			pick(screenDisplay, "size"),
			{ position: pick(screenDisplay?.bounds, "x", "y") }
		);
	}
}

// Singleton instance for easy import
export const monitorService = new MonitorService();

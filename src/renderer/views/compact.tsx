import React from "react";
import { Paper, Stack } from "@mui/material";
import WindowBar from "../components/window-bar";
import { useAppSelector } from "../hooks";
import MonitorToggle from "../components/monitor/monitor-toggle";
import MonitorModeToggle from "../components/monitor/monitor-mode-toggle";
import MonitorBrightnessSlider from "../components/monitor/monitor-brightness-slider";
import { GLOBAL } from "lumi-control";

const CompactView = () => {
	const mode = useAppSelector((state) => state.app.mode);
	const activeMonitor = useAppSelector((state) => state.app.activeMonitor);
	const brightness = useAppSelector((state) => state.app.brightness);

	return mode === "compact" ? (
		<Stack justifyContent={"end"} height={"100%"}>
			<div style={{ flex: 1, width: "100%" }} data-enable-pass-through={true} />
			<Paper
				sx={{
					borderRadius: 4,
					overflow: "hidden",
				}}
				elevation={8}
			>
				<WindowBar />
				<Paper sx={{ zIndex: 40, position: "relative", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} elevation={4}>
					<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
						{activeMonitor ? (
							<Stack direction={"row"} alignItems={"center"} spacing={1} p={1}>
								<MonitorToggle variant={"icon-button"} monitorId={activeMonitor.id} disabled={activeMonitor.disabled} />
								<MonitorModeToggle variant={"icon-button"} monitorId={activeMonitor.id} mode={activeMonitor.mode} />
							</Stack>
						) : null}
						{activeMonitor ? (
							<MonitorBrightnessSlider
								monitorId={activeMonitor.id}
								mode={activeMonitor.mode}
								brightness={activeMonitor.brightness}
								disabled={activeMonitor.disabled}
							/>
						) : (
							<MonitorBrightnessSlider monitorId={GLOBAL} mode={"native"} brightness={brightness} disabled={false} />
						)}
					</Stack>
				</Paper>
			</Paper>
		</Stack>
	) : null;
};

export default CompactView;

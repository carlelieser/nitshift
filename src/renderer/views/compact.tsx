import React from "react";
import { Box, Paper, Stack } from "@mui/material";
import { useAppSelector } from "@hooks";
import MonitorToggle from "../components/monitor/monitor-toggle";
import MonitorModeToggle from "../components/monitor/monitor-mode-toggle";
import MonitorBrightnessSlider from "../components/monitor/monitor-brightness-slider";
import { GLOBAL } from "@common/types";

const CompactView = () => {
	const mode = useAppSelector((state) => state.app.mode);
	const activeMonitor = useAppSelector((state) =>
		state.app.monitors.find((monitor) => monitor.id === state.app.activeMonitor?.id)
	);
	const brightness = useAppSelector((state) => state.app.brightness);

	return mode === "compact" ? (
		<Box
			sx={{
				overflow: "hidden",
				zIndex: 0
			}}
		>
			<Paper
				sx={{
					zIndex: 40,
					position: "relative"
				}}
				square={true}
				elevation={1}
				variant={"elevation"}
			>
				<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
					{activeMonitor ? (
						<Stack direction={"row"} alignItems={"center"} spacing={1} p={1}>
							<MonitorToggle
								variant={"icon-button"}
								monitorId={activeMonitor.id}
								disabled={activeMonitor.disabled}
							/>
							<MonitorModeToggle
								variant={"icon-button"}
								monitorId={activeMonitor.id}
								mode={activeMonitor.mode}
							/>
						</Stack>
					) : null}
					{activeMonitor ? (
						<MonitorBrightnessSlider
							monitorId={activeMonitor.id}
							mode={activeMonitor.mode}
							brightness={activeMonitor.brightness}
							disabled={activeMonitor.disabled}
							position={activeMonitor.position}
							size={activeMonitor.size}
						/>
					) : (
						<MonitorBrightnessSlider
							monitorId={GLOBAL}
							mode={"native"}
							brightness={brightness}
							disabled={false}
							position={{ x: 0, y: 0 }}
							size={{ width: 0, height: 0 }}
						/>
					)}
				</Stack>
			</Paper>
		</Box>
	) : null;
};

export default CompactView;

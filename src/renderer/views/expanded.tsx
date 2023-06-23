import React from "react";
import WindowBar from "../components/window-bar";
import MonitorList from "../components/monitor/monitor-list";
import { Divider, Paper, Stack } from "@mui/material";
import { useAppSelector } from "../hooks";
import ScheduleButton from "../components/schedule-button";
import PremiumBanner from "../components/premium-banner";
import MonitorListRefreshButton from "../components/monitor/monitor-list-refresh-button";

const ExpandedView = () => {
	const mode = useAppSelector((state) => state.app.mode);

	return mode === "expanded" ? (
		<Paper
			sx={{
				borderRadius: 4,
				height: "100%",
				overflow: "hidden",
				position: "relative",
			}}
			elevation={8}
		>
			<Paper
				sx={{
					borderRadius: 4,
					height: "100%",
					overflowX: "hidden",
					display: "flex",
					flexDirection: "column",
					position: "relative",
				}}
				elevation={0}
			>
				<WindowBar />
				<Stack spacing={1} pt={1}>
					<Stack spacing={2} px={2} bgcolor={"inherit"}>
						<PremiumBanner />
						<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
							<MonitorListRefreshButton />
							<Divider orientation={"vertical"} flexItem={true} />
							<ScheduleButton />
						</Stack>
					</Stack>
					<Divider />
					<MonitorList />
				</Stack>
			</Paper>
		</Paper>
	) : null;
};

export default ExpandedView;

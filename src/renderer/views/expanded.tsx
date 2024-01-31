import React from "react";
import MonitorList from "@components/monitor/monitor-list";
import { Box } from "@mui/material";
import { useAppSelector } from "@hooks";
import LicenseBar from "@components/license/license-bar";

const ExpandedView = () => {
	const mode = useAppSelector((state) => state.app.mode);

	return mode === "expanded" ? (
		<Box flexGrow={1} width={"100%"} height={"100%"} display={"flex"} flexDirection={"column"} overflow={"hidden"}>
			<MonitorList />
			<LicenseBar />
		</Box>
	) : null;
};

export default ExpandedView;

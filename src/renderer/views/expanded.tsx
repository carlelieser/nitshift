import React from "react";
import { Box, Paper } from "@mui/material";
import { useAppSelector } from "@hooks";
import MonitorList from "@components/monitor/monitor-list";
import LicenseBar from "@components/license/license-bar";

const ExpandedView = () => {
	const mode = useAppSelector((state) => state.app.mode);

	return mode === "expanded" ? (
		<Box
			component={Paper}
			flexGrow={1}
			width={"100%"}
			height={"100%"}
			display={"flex"}
			flexDirection={"column"}
			overflow={"hidden"}
			elevation={0}
			variant={"elevation"}
		>
			<MonitorList />
			<LicenseBar />
		</Box>
	) : null;
};

export default ExpandedView;

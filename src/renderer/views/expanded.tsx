import React, { lazy, Suspense } from "react";
import { Box, Paper } from "@mui/material";
import { useAppSelector } from "@hooks";
import { maskStyles } from "../utils";

const MonitorList = lazy(() => import("@components/monitor/monitor-list"));
const LicenseBar = lazy(() => import("@components/license/license-bar"));

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
			style={maskStyles}
		>
			<Suspense>
				<MonitorList />
				<LicenseBar />
			</Suspense>
		</Box>
	) : null;
};

export default ExpandedView;

import React, { lazy, Suspense } from "react";
import { Box } from "@mui/material";
import { useAppSelector } from "@hooks";

const MonitorList = lazy(() => import("@components/monitor/monitor-list"));
const LicenseBar = lazy(() => import("@components/license/license-bar"));

const ExpandedView = () => {
	const mode = useAppSelector((state) => state.app.mode);

	return mode === "expanded" ? (
		<Box flexGrow={1} width={"100%"} height={"100%"} display={"flex"} flexDirection={"column"} overflow={"hidden"}>
			<Suspense>
				<MonitorList />
				<LicenseBar />
			</Suspense>
		</Box>
	) : null;
};

export default ExpandedView;

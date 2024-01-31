import React from "react";
import { Refresh } from "mui-symbols";
import { Button, Tooltip, Typography } from "@mui/material";
import { refreshAvailableMonitors } from "../../reducers/app";
import { useAppDispatch } from "../../hooks";

const MonitorListRefreshButton = () => {
	const dispatch = useAppDispatch();
	const handleRefresh = () => dispatch(refreshAvailableMonitors(true));

	return (
		<Tooltip title={<Typography>Refresh monitor list</Typography>}>
			<Button color={"inherit"} startIcon={<Refresh />} size={"small"} onClick={handleRefresh}>
				Refresh
			</Button>
		</Tooltip>
	);
};

export default MonitorListRefreshButton;

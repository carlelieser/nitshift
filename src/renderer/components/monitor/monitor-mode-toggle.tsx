import React, { useMemo } from "react";
import { Box, IconButton, ListItemIcon, ListItemText, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import { DonutLarge, DonutSmall, InfoOutlined } from "mui-symbols";
import { UIMonitor } from "@common/types";
import { useAppDispatch } from "@hooks";
import { setMonitorMode } from "@reducers/app";

interface MonitorModeToggleProps {
	variant: "menu-item" | "icon-button";
	monitorId: string;
	mode: UIMonitor["mode"];
}

const MonitorModeToggle: React.FC<MonitorModeToggleProps> = ({ variant, monitorId, mode }) => {
	const dispatch = useAppDispatch();
	const label = useMemo(() => (mode === "native" ? "Enable shade" : "Disable shade"), [mode]);
	const icon = useMemo(() => (mode === "native" ? <DonutSmall /> : <DonutLarge />), [mode]);

	const toggle = () => {
		dispatch(
			setMonitorMode({
				id: monitorId,
				mode: mode === "native" ? "shade" : "native"
			})
		);
	};

	return useMemo(
		() =>
			variant === "menu-item" ? (
				<Box>
					<MenuItem onClick={toggle}>
						<ListItemIcon>{icon}</ListItemIcon>
						<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} gap={2}>
							<ListItemText primary={label} />
						</Stack>
						<Tooltip
							title={
								<Typography>
									Shade mode allows setting monitor brightness even if the connection type does not
									support it.
								</Typography>
							}
						>
							<ListItemIcon sx={{ ml: 4 }}>
								<InfoOutlined fontSize={"small"} opacity={0.7} />
							</ListItemIcon>
						</Tooltip>
					</MenuItem>
				</Box>
			) : (
				<Tooltip title={<Typography>{label}</Typography>}>
					<Box>
						<IconButton color={"inherit"} onClick={toggle}>
							{icon}
						</IconButton>
					</Box>
				</Tooltip>
			),
		[variant, icon, label]
	);
};

export default MonitorModeToggle;

import React, { useMemo } from "react";
import {
	Badge,
	Box,
	Chip,
	IconButton,
	ListItemIcon,
	ListItemText,
	MenuItem,
	Stack,
	Tooltip,
	Typography
} from "@mui/material";
import { DonutLarge, DonutSmall, InfoOutlined } from "mui-symbols";
import { UIMonitor } from "@common/types";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setMonitorMode } from "@reducers/app";

interface MonitorModeToggleProps {
	variant: "menu-item" | "icon-button";
	monitorId: string;
	mode: UIMonitor["mode"];
}

const MonitorModeToggle: React.FC<MonitorModeToggleProps> = ({ variant, monitorId, mode }) => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
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
				<Tooltip
					title={
						license === "free" ? (
							<Typography>
								Shade mode allows setting monitor brightness even if the connection type does not
								support it.
							</Typography>
						) : null
					}
					enterDelay={1000}
				>
					<Box>
						<MenuItem disabled={license === "free"} onClick={toggle}>
							<ListItemIcon>{icon}</ListItemIcon>
							<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} gap={2}>
								<ListItemText primary={label} />
								{license === "free" ? <Chip size={"small"} label={"PRO"} /> : null}
							</Stack>
							<Tooltip
								title={
									<Typography>
										Shade mode allows setting monitor brightness even if the connection type does
										not support it.
									</Typography>
								}
							>
								<ListItemIcon sx={{ ml: 4 }}>
									<InfoOutlined fontSize={"small"} opacity={0.7} />
								</ListItemIcon>
							</Tooltip>
						</MenuItem>
					</Box>
				</Tooltip>
			) : (
				<Tooltip title={<Typography>{label}</Typography>}>
					<Box>
						<IconButton disabled={license === "free"} color={"inherit"} onClick={toggle}>
							<Badge badgeContent={"PRO"} color={"warning"}>
								{icon}
							</Badge>
						</IconButton>
					</Box>
				</Tooltip>
			),
		[variant, license, icon, label]
	);
};

export default MonitorModeToggle;

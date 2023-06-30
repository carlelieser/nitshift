import React, { useMemo } from "react";
import { Badge, Box, IconButton, ListItemIcon, ListItemText, MenuItem, Tooltip, Typography } from "@mui/material";
import { AutoAwesome, DisplaySettings, DonutLarge, DonutSmall, Info } from "@mui/icons-material";
import { UIMonitor } from "../../../common/types";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setMonitorMode } from "../../reducers/app";
import PremiumTooltip from "../premium-tooltip";

interface MonitorModeToggleProps {
	variant: "menu-item" | "icon-button";
	monitorId: string;
	mode: UIMonitor["mode"];
}

const MonitorModeToggle: React.FC<MonitorModeToggleProps> = ({ variant, monitorId, mode }) => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
	const label = useMemo(() => (mode === "native" ? "Use shade mode" : "Use native mode"), [mode]);
	const icon = useMemo(() => (mode === "native" ? <DonutSmall /> : <DonutLarge />), [mode]);

	const toggle = () => {
		dispatch(
			setMonitorMode({
				id: monitorId,
				mode: mode === "native" ? "shade" : "native",
			})
		);
	};

	return variant === "menu-item" ? (
		<Tooltip
			title={
				license === "free" ? (
					<Typography>Shade mode allows setting monitor brightness even if the connection type does not support it</Typography>
				) : null
			}
		>
			<Box>
				<MenuItem disabled={license === "free"} onClick={toggle}>
					<ListItemIcon>{icon}</ListItemIcon>
					<ListItemText primary={label} secondary={license === "free" ? "Premium Feature" : null} />
					<Tooltip
						title={
							<Typography>
								Shade mode allows setting monitor brightness even if the connection type does not support it
							</Typography>
						}
					>
						<ListItemIcon sx={{ ml: 4 }}>
							<Info fontSize={"small"} opacity={0.7} />
						</ListItemIcon>
					</Tooltip>
				</MenuItem>
			</Box>
		</Tooltip>
	) : (
		<PremiumTooltip title={label}>
			<Box>
				<IconButton disabled={license === "free"} color={"inherit"} onClick={toggle}>
					<Badge badgeContent={license === "free" ? <AutoAwesome sx={{ fontSize: 12 }} color={"warning"} /> : null}>{icon}</Badge>
				</IconButton>
			</Box>
		</PremiumTooltip>
	);
};

export default MonitorModeToggle;

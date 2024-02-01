import React, { useMemo } from "react";
import { Badge, Box, IconButton, ListItemIcon, ListItemText, MenuItem, Tooltip, Typography } from "@mui/material";
import { DonutLarge, DonutSmall, InfoOutlined, StarRoundedFilled } from "mui-symbols";
import { UIMonitor } from "@common/types";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setMonitorMode } from "@reducers/app";
import ProTooltip from "../promotional/pro-tooltip";
import { amber } from "@mui/material/colors";

interface MonitorModeToggleProps {
	variant: "menu-item" | "icon-button";
	monitorId: string;
	mode: UIMonitor["mode"];
}

const MonitorModeToggle: React.FC<MonitorModeToggleProps> = ({ variant, monitorId, mode }) => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
	const label = useMemo(() => (mode === "native" ? "Enable shade mode" : "Disable shade mode"), [mode]);
	const icon = useMemo(() => (mode === "native" ? <DonutSmall /> : <DonutLarge />), [mode]);

	const toggle = () => {
		dispatch(
			setMonitorMode({
				id: monitorId,
				mode: mode === "native" ? "shade" : "native"
			})
		);
	};

	return variant === "menu-item" ? (
		<Tooltip
			title={
				license === "free" ? (
					<Typography>
						Shade mode allows setting monitor brightness even if the connection type does not support it.
					</Typography>
				) : null
			}
			enterDelay={1000}
		>
			<Box>
				<MenuItem disabled={license === "free"} onClick={toggle}>
					<ListItemIcon>{icon}</ListItemIcon>
					<ListItemText
						primary={label}
						secondary={
							license === "free" ? (
								<Typography variant={"caption"} textTransform={"uppercase"} fontSize={"small"}>
									Pro Feature
								</Typography>
							) : null
						}
					/>
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
		</Tooltip>
	) : (
		<ProTooltip title={label}>
			<Box>
				<IconButton disabled={license === "free"} color={"inherit"} onClick={toggle}>
					<Badge
						badgeContent={
							license === "free" ? <StarRoundedFilled sx={{ fontSize: 12, color: amber[500] }} /> : null
						}
					>
						{icon}
					</Badge>
				</IconButton>
			</Box>
		</ProTooltip>
	);
};

export default MonitorModeToggle;

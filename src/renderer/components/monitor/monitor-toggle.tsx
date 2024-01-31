import React, { useMemo } from "react";
import { IconButton, ListItemIcon, ListItemText, MenuItem, Tooltip, Typography } from "@mui/material";
import { DesktopAccessDisabled, DesktopWindowsOutlined, InfoOutlined } from "mui-symbols";
import { useAppDispatch } from "@hooks";
import { setMonitorDisabled } from "@reducers/app";

interface MonitorToggleProps {
	variant: "menu-item" | "icon-button";
	monitorId: string;
	disabled: boolean;
}

const MonitorToggle: React.FC<MonitorToggleProps> = ({ variant, monitorId, disabled }) => {
	const dispatch = useAppDispatch();

	const icon = useMemo(() => (!disabled ? <DesktopWindowsOutlined /> : <DesktopAccessDisabled />), [disabled]);
	const label = useMemo(() => (disabled ? "Enable" : "Disable"), [disabled]);

	const toggle = () => {
		dispatch(
			setMonitorDisabled({
				id: monitorId,
				disabled: !disabled,
			})
		);
	};

	return variant === "menu-item" ? (
		<MenuItem onClick={toggle}>
			<ListItemIcon>{icon}</ListItemIcon>
			<ListItemText primary={label} />
			<Tooltip title={<Typography>Disabled monitors are excluded from changes in global brightness.</Typography>}>
				<ListItemIcon>
					<InfoOutlined fontSize={"small"} opacity={0.7} />
				</ListItemIcon>
			</Tooltip>
		</MenuItem>
	) : (
		<Tooltip title={<Typography>{label}</Typography>}>
			<IconButton color={"inherit"} onClick={toggle}>
				{icon}
			</IconButton>
		</Tooltip>
	);
};

export default MonitorToggle;

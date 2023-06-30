import React, { createRef, useMemo, useRef } from "react";
import { Box, IconButton, ListItemIcon, Menu, MenuItem, MenuProps } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useAppSelector } from "../../hooks";
import MonitorToggle from "./monitor-toggle";
import MonitorModeToggle from "./monitor-mode-toggle";
import MonitorRename from "./monitor-rename";

interface MonitorOverflowMenuProps extends Omit<MenuProps, "anchorEl"> {
	disabled: boolean;
	monitorId: string;
	onOpen: () => void;
}

const MonitorOverflowMenu: React.FC<MonitorOverflowMenuProps> = ({ open, disabled = false, onOpen, onClose, monitorId }) => {
	const monitor = useAppSelector((state) => state.app.monitors.find((monitor) => monitor.id === monitorId));
	const ref = useRef<HTMLButtonElement>();

	return (
		<Box>
			<Menu
				autoFocus={open}
				keepMounted={true}
				open={open}
				anchorEl={ref.current}
				onClose={onClose}
				onClick={() => onClose({}, "backdropClick")}
			>
				<MonitorRename monitorId={monitorId} currentName={monitor.nickname} />
				<MonitorToggle variant={"menu-item"} monitorId={monitorId} disabled={monitor.disabled} />
				<MonitorModeToggle variant={"menu-item"} monitorId={monitorId} mode={monitor.mode} />
			</Menu>
			<IconButton disabled={disabled} ref={ref} onClick={onOpen}>
				<MoreVert />
			</IconButton>
		</Box>
	);
};

export default MonitorOverflowMenu;

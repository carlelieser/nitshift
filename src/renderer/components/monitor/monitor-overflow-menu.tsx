import React, { useCallback, useMemo, useRef, useState } from "react";
import { Box, createTheme, Divider, IconButton, Menu, MenuProps, ThemeProvider, useTheme } from "@mui/material";
import { MoreVert } from "mui-symbols";
import { useAppSelector } from "../../hooks";
import MonitorToggle from "./monitor-toggle";
import MonitorModeToggle from "./monitor-mode-toggle";
import MonitorRename from "./monitor-rename";

interface MonitorOverflowMenuProps extends Omit<MenuProps, "anchorEl" | "open"> {
	disabled: boolean;
	monitorId: string;
}

const MonitorOverflowMenu: React.FC<MonitorOverflowMenuProps> = ({ disabled = false, monitorId }) => {
	const monitor = useAppSelector((state) => state.app.monitors.find((monitor) => monitor.id === monitorId));
	const [isOpen, setIsOpen] = useState(false);

	const open = useCallback(() => setIsOpen(true), []);

	const ref = useRef<HTMLButtonElement>();
	const defaultTheme = useTheme();
	const theme = useMemo(() => {
		return createTheme({
			...defaultTheme,
			components: {
				...defaultTheme.components,
				MuiTooltip: {}
			}
		});
	}, [defaultTheme]);

	const handleClose = useCallback(() => setIsOpen(false), []);

	return (
		<ThemeProvider theme={theme}>
			<Box>
				<Menu
					autoFocus={isOpen}
					keepMounted={true}
					open={isOpen}
					anchorEl={ref.current}
					onClose={handleClose}
					onClick={handleClose}
				>
					<MonitorModeToggle variant={"menu-item"} monitorId={monitorId} mode={monitor.mode} />
					<Divider sx={{ my: 1 }} />
					<MonitorRename monitorId={monitorId} currentName={monitor.nickname} />
					<MonitorToggle variant={"menu-item"} monitorId={monitorId} disabled={monitor.disabled} />
				</Menu>
				<IconButton color={"inherit"} disabled={disabled} ref={ref} onClick={open}>
					<MoreVert />
				</IconButton>
			</Box>
		</ThemeProvider>
	);
};

export default MonitorOverflowMenu;

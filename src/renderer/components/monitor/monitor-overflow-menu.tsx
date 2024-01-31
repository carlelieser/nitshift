import React, { useMemo, useRef } from "react";
import { Box, createTheme, Divider, IconButton, Menu, MenuProps, ThemeProvider, useTheme } from "@mui/material";
import { MoreVert } from "mui-symbols";
import { useAppSelector } from "../../hooks";
import MonitorToggle from "./monitor-toggle";
import MonitorModeToggle from "./monitor-mode-toggle";
import MonitorRename from "./monitor-rename";

interface MonitorOverflowMenuProps extends Omit<MenuProps, "anchorEl"> {
	disabled: boolean;
	monitorId: string;
	onOpen: () => void;
}

const MonitorOverflowMenu: React.FC<MonitorOverflowMenuProps> = ({
	open,
	disabled = false,
	onOpen,
	onClose,
	monitorId,
}) => {
	const monitor = useAppSelector((state) => state.app.monitors.find((monitor) => monitor.id === monitorId));
	const ref = useRef<HTMLButtonElement>();
	const defaultTheme = useTheme();
	const theme = useMemo(() => {
		return createTheme({
			...defaultTheme,
			components: {
				...defaultTheme.components,
				MuiTooltip: {},
			},
		});
	}, [defaultTheme]);

	return (
		<ThemeProvider theme={theme}>
			<Box>
				<Menu
					autoFocus={open}
					keepMounted={true}
					open={open}
					anchorEl={ref.current}
					sx={{
						marginLeft: process.env.CAPTURE ? -23.5 : 0,
					}}
					onClose={onClose}
					onClick={() => onClose({}, "backdropClick")}
				>
					<MonitorModeToggle variant={"menu-item"} monitorId={monitorId} mode={monitor.mode} />
					<Divider sx={{ my: 1 }} />
					<MonitorRename monitorId={monitorId} currentName={monitor.nickname} />
					<MonitorToggle variant={"menu-item"} monitorId={monitorId} disabled={monitor.disabled} />
				</Menu>
				<IconButton color={"inherit"} disabled={disabled} ref={ref} onClick={onOpen}>
					<MoreVert />
				</IconButton>
			</Box>
		</ThemeProvider>
	);
};

export default MonitorOverflowMenu;

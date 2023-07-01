import React, { useEffect, useMemo, useState } from "react";
import { Badge, Box, ClickAwayListener, createTheme, Paper, Stack, ThemeProvider, Typography, useTheme } from "@mui/material";
import { DragHandle, Monitor as MdMonitor } from "@mui/icons-material";
import { GLOBAL } from "lumi-control";
import { UIMonitor } from "../../../common/types";
import { merge, upperCase } from "lodash";
import { teal, common } from "@mui/material/colors";
import MonitorToggle from "./monitor-toggle";
import MonitorModeToggle from "./monitor-mode-toggle";
import MonitorBrightnessSlider from "./monitor-brightness-slider";
import Color from "color";
import { DraggableProvided } from "react-beautiful-dnd";
import MonitorOverflowMenu from "./monitor-overflow-menu";

const darkTeal = Color(teal[900]).darken(0.6).alpha(0.4).hexa();

interface MonitorProps extends UIMonitor {
	menuDisabled: boolean;
	dragHandleProps?: DraggableProvided["dragHandleProps"];
	dragDisabled?: boolean;
}

const Monitor: React.FC<MonitorProps> = ({
	id,
	name,
	nickname,
	mode,
	brightness,
	disabled,
	menuDisabled = false,
	dragHandleProps = null,
	dragDisabled = true,
}) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const theme = useTheme();
	const monitorTheme = useMemo(
		() =>
			createTheme({
				...theme,
				components:
					disabled || id === GLOBAL
						? theme.components
						: {
								MuiTooltip: {
									defaultProps: {
										arrow: false,
										disableInteractive: true,
									},
									styleOverrides: {
										tooltip: {
											backgroundColor: darkTeal,
											backdropFilter: "blur(20px)",
										},
									},
								},
								MuiSlider: {
									styleOverrides: {
										valueLabel: {
											backgroundColor: darkTeal,
											backdropFilter: "blur(20px)",
										},
									},
								},
						  },
			}),
		[theme, id, disabled]
	);

	const formattedId = useMemo(() => {
		try {
			return id.split("\\")[1];
		} catch (err) {
			console.log(err);
			return id;
		}
	}, [id]);

	const instanceCount = useMemo(() => {
		try {
			const count = Number(id.split("_").pop());
			return Number.isNaN(count) ? 0 : count;
		} catch (err) {
			return 0;
		}
	}, [id]);

	const hoverStyles = useMemo(() => {
		return disabled || id === GLOBAL
			? {}
			: {
					bgcolor: teal[800],
					transform: "scale(1.05)",
					boxShadow: theme.shadows[7],
					"& .drag-handle": dragDisabled ? {} : { display: "block" },
					"& .monitor-icon": dragDisabled ? {} : { display: "none" },
					"& .brightness-slider-container": {
						bgcolor: teal[500],
						"& .brightness-slider": {
							color: common.white,
						},
					},
			  };
	}, [disabled, id, dragDisabled, theme]);

	const openMenu = () => setMenuOpen(true);
	const closeMenu = () => {
		if (isHovered) setIsHovered(false);
		setMenuOpen(false);
	};

	const handleMouseEnter = () => {
		setIsHovered(true);
	};

	const handleMouseLeave = () => {
		if (menuOpen) return;
		setIsHovered(false);
	};

	return (
		<ThemeProvider theme={monitorTheme}>
			<ClickAwayListener onClickAway={() => setIsHovered(false)}>
				<Paper
					sx={merge(
						{},
						{
							borderRadius: 3,
							width: "100%",
							position: "relative",
							transition: theme.transitions.create(["background-color", "color", "box-shadow", "transform"]),
							"& .drag-handle": {
								display: "none",
							},
							"&:hover": hoverStyles,
						},
						isHovered ? hoverStyles : {}
					)}
					elevation={disabled ? 1 : 4}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<Stack height={"100%"}>
						{id === GLOBAL ? null : (
							<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} px={2} py={1}>
								<Stack direction={"row"} spacing={2} alignItems={"center"}>
									<Badge badgeContent={dragDisabled || !instanceCount ? null : instanceCount}>
										<Box {...(dragHandleProps ?? {})}>
											<MdMonitor className={"monitor-icon"} opacity={0.8} color={"inherit"} />
											<DragHandle className={"drag-handle"} />
										</Box>
									</Badge>
									<Stack spacing={-0.5}>
										<Typography fontWeight={500}>{upperCase(nickname)}</Typography>
										<Typography variant={"subtitle2"} fontSize={12} sx={{ opacity: 0.7, width: 145 }} noWrap={true}>
											{formattedId}
										</Typography>
									</Stack>
								</Stack>
								<MonitorOverflowMenu
									monitorId={id}
									disabled={menuDisabled}
									open={menuOpen}
									onOpen={openMenu}
									onClose={closeMenu}
								/>
							</Stack>
						)}
						<Paper
							className={"brightness-slider-container"}
							sx={{
								borderRadius: 2,
								transition: theme.transitions.create(["background-color"]),
								"& .brightness-slider": {
									transition: theme.transitions.create(["color"]),
								},
							}}
							variant={"outlined"}
						>
							<MonitorBrightnessSlider monitorId={id} mode={mode} brightness={brightness} disabled={disabled} />
						</Paper>
					</Stack>
				</Paper>
			</ClickAwayListener>
		</ThemeProvider>
	);
};

export default Monitor;

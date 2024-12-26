import React, { useMemo, useState } from "react";
import { Badge, Box, ClickAwayListener, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DragHandle, MonitorOutlined } from "mui-symbols";
import { GLOBAL, UIMonitor } from "@common/types";
import { merge } from "lodash";
import { common, grey, teal } from "@mui/material/colors";
import MonitorBrightnessSlider from "./monitor-brightness-slider";
import { DraggableProvided } from "react-beautiful-dnd";
import MonitorOverflowMenu from "./monitor-overflow-menu";
import { getFormattedMonitorId } from "@utils";
import { useAppSelector } from "@hooks";

interface MonitorProps extends UIMonitor {
	menuDisabled: boolean;
	dragHandleProps?: DraggableProvided["dragHandleProps"];
	dragDisabled?: boolean;
}

const Monitor: React.FC<MonitorProps> = ({
	id,
	nickname,
	mode,
	brightness,
	disabled,
	menuDisabled = false,
	dragHandleProps = null,
	dragDisabled = true
}) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const appearance = useAppSelector((state) => state.app.appearance);

	const theme = useTheme();

	const formattedId = useMemo(() => getFormattedMonitorId(id), [id]);

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
					color: common.white,
					transform: "scale(1.05)",
					boxShadow: theme.shadows[7],
					"& .drag-handle": dragDisabled ? {} : { display: "block" },
					"& .monitor-icon": dragDisabled ? {} : { display: "none" },
					"& .brightness-slider-container": {
						bgcolor: teal[500],
						color: common.white,
						"& .brightness-slider": {
							color: common.white
						}
					}
			  };
	}, [disabled, id, dragDisabled, theme.shadows]);

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
							display: "none"
						},
						"&:hover": hoverStyles
					},
					isHovered ? hoverStyles : {},
					appearance === "light"
						? {
								bgcolor: common.white,
								color: common.black,
								"& .brightness-slider-container": {
									bgcolor: disabled ? grey[100] : teal[500],
									color: disabled ? common.black : common.white,
									"& .brightness-slider": {
										color: disabled ? common.black : common.white,
										opacity: disabled ? 0.5 : 1
									}
								}
						  }
						: {}
				)}
				variant={appearance === "light" || disabled ? "outlined" : "elevation"}
				elevation={disabled ? 0 : 1}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<Stack height={"100%"}>
					{id === GLOBAL ? null : (
						<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} px={2} py={1}>
							<Stack direction={"row"} spacing={2} alignItems={"center"}>
								<Badge badgeContent={dragDisabled || !instanceCount ? null : instanceCount}>
									<Box {...(dragHandleProps ?? {})}>
										<MonitorOutlined className={"monitor-icon"} opacity={0.8} color={"inherit"} />
										<DragHandle className={"drag-handle"} />
									</Box>
								</Badge>
								<Stack spacing={-0.5}>
									<Typography fontWeight={500} textTransform={"uppercase"}>
										{nickname}
									</Typography>
									<Typography
										variant={"subtitle2"}
										fontSize={12}
										sx={{ opacity: 0.7, width: 145 }}
										noWrap={true}
									>
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
							borderRadius: 3,
							transition: theme.transitions.create(["background-color"]),
							"& .brightness-slider": {
								transition: theme.transitions.create(["color"])
							}
						}}
						variant={"elevation"}
						elevation={appearance === "light" ? 0 : 6}
					>
						<MonitorBrightnessSlider
							monitorId={id}
							mode={mode}
							brightness={brightness}
							disabled={disabled}
						/>
					</Paper>
				</Stack>
			</Paper>
		</ClickAwayListener>
	);
};

export default Monitor;

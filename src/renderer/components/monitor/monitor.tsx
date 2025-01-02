import React, { useCallback, useMemo, useState } from "react";
import { Badge, Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DragHandle, MonitorOutlined } from "mui-symbols";
import { GLOBAL, UIMonitor } from "@common/types";
import MonitorBrightnessSlider from "./monitor-brightness-slider";
import { DraggableProvided } from "react-beautiful-dnd";
import { getFormattedMonitorId } from "@utils";
import { useAppSelector } from "@hooks";
import MonitorOverflowMenu from "./monitor-overflow-menu";
import Color from "color";

interface MonitorProps extends Omit<UIMonitor, "displayId"> {
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
	position,
	size,
	menuDisabled = false,
	dragHandleProps = null,
	dragDisabled = true
}) => {
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

	const handleMouseEnter = useCallback(() => setIsHovered(true), []);
	const handleMouseLeave = useCallback(() => setIsHovered(false), []);

	const isActionable = useMemo(() => !disabled && !dragDisabled && isHovered, [disabled, dragDisabled, isHovered]);

	const containerStyle = useMemo(
		() => ({
			borderRadius: 4,
			bgcolor: isActionable ? theme.palette.primary.main : theme.palette.background.paper,
			color: isActionable ? theme.palette.primary.contrastText : theme.palette.text.primary,
			transition: theme.transitions.create(["background-color"]),
			"&:hover": {
				boxShadow: isActionable ? theme.shadows[2] : "none"
			}
		}),
		[
			isActionable,
			theme.palette.primary.main,
			theme.palette.background.paper,
			theme.transitions,
			theme.palette.primary.contrastText,
			theme.palette.text.primary,
			theme.shadows
		]
	);

	const sliderContainerStyle = useMemo(
		() => ({
			...containerStyle,
			bgcolor: Color(containerStyle.bgcolor).lighten(0.2).hex()
		}),
		[containerStyle]
	);

	const sliderColor = useMemo(
		() => (isActionable ? theme.palette.primary.contrastText : theme.palette.primary.main),
		[isActionable, theme.palette.primary.contrastText, theme.palette.primary.main]
	);

	const containerVariant = useMemo(
		() => (appearance === "light" || disabled ? "outlined" : "elevation"),
		[appearance, disabled]
	);

	const containerElevation = useMemo(() => (disabled ? 0 : 1), [disabled]);

	return (
		<Paper
			sx={containerStyle}
			variant={containerVariant}
			elevation={containerElevation}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<Stack height={"100%"}>
				{id === GLOBAL ? null : (
					<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} px={2} py={1}>
						<Stack direction={"row"} spacing={2} alignItems={"center"}>
							<Badge badgeContent={dragDisabled || !instanceCount ? null : instanceCount}>
								<Box {...(dragHandleProps ?? {})}>
									{isHovered && !disabled ? (
										<DragHandle />
									) : (
										<MonitorOutlined opacity={0.8} color={"inherit"} />
									)}
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
						<MonitorOverflowMenu monitorId={id} disabled={menuDisabled} />
					</Stack>
				)}
				<Paper sx={sliderContainerStyle} variant={"elevation"} elevation={appearance === "light" ? 0 : 8}>
					<MonitorBrightnessSlider
						monitorId={id}
						mode={mode}
						brightness={brightness}
						disabled={disabled}
						position={position}
						size={size}
						color={sliderColor}
					/>
				</Paper>
			</Stack>
		</Paper>
	);
};

export default Monitor;

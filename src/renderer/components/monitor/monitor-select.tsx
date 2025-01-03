import React, { useMemo } from "react";
import { Button, Chip, ListItemText, ListSubheader, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setActiveMonitor } from "@reducers/app";
import { ArrowDropDown, MonitorOutlined } from "mui-symbols";
import { getFormattedMonitorId } from "@utils";
import { GLOBAL } from "@common/types";

const MonitorSelect = () => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
	const monitors = useAppSelector((state) => state.app.monitors);
	const connectedMonitors = useMemo(() => monitors.filter((monitor) => monitor.connected), [monitors]);
	const globalBrightness = useAppSelector((state) => state.app.brightness);
	const activeMonitor = useAppSelector((state) => state.app.activeMonitor);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<Tooltip
				title={
					<Typography textTransform={"uppercase"}>
						{activeMonitor?.nickname ?? activeMonitor?.name ?? "Global"} ·{" "}
						{activeMonitor?.brightness ?? globalBrightness}%
					</Typography>
				}
			>
				<Button
					size={"small"}
					startIcon={<MonitorOutlined />}
					endIcon={<ArrowDropDown />}
					fullWidth={true}
					onClick={handleClick}
					sx={{
						px: 1
					}}
				>
					<Typography
						variant={"button"}
						textTransform={"uppercase"}
						noWrap={true}
						minWidth={80}
						maxWidth={100}
						overflow={"hidden"}
						textOverflow={"ellipsis"}
						textAlign={"left"}
					>
						{activeMonitor?.nickname ?? GLOBAL}
					</Typography>
				</Button>
			</Tooltip>
			<Menu
				PaperProps={{
					style: {
						minHeight: 200,
						minWidth: 200
					}
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
			>
				<ListSubheader>Monitors</ListSubheader>
				{license === "free" ? null : (
					<MenuItem
						selected={!activeMonitor}
						onClick={() => {
							dispatch(setActiveMonitor(null));
							setAnchorEl(null);
						}}
					>
						Global
					</MenuItem>
				)}
				{connectedMonitors.map(({ id, nickname }, index) => (
					<MenuItem
						disabled={license === "free" ? index > 1 : null}
						key={`monitor-item-${id}`}
						selected={activeMonitor?.id === id}
						onClick={() => {
							dispatch(setActiveMonitor(id));
							setAnchorEl(null);
						}}
					>
						<ListItemText sx={{ textTransform: "uppercase" }} secondary={getFormattedMonitorId(id)}>
							<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
								{nickname} {license === "free" && index > 1 && <Chip size={"small"} label={"Pro"} />}
							</Stack>
						</ListItemText>
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default MonitorSelect;

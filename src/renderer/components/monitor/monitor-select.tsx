import React from "react";
import { Button, ListItemText, ListSubheader, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import { selectConnectedMonitors, useAnchorMenu, useAppDispatch, useAppSelector } from "@hooks";
import { setActiveMonitor } from "@reducers/app";
import { ArrowDropDown, MonitorOutlined } from "mui-symbols";
import { getFormattedMonitorId } from "@utils";
import { GLOBAL } from "@common/types";

const MonitorSelect = () => {
	const dispatch = useAppDispatch();
	const connectedMonitors = useAppSelector(selectConnectedMonitors);
	const globalBrightness = useAppSelector((state) => state.app.brightness);
	const activeMonitor = useAppSelector((state) => state.app.activeMonitor);
	const { anchorEl, open, handleOpen, handleClose } = useAnchorMenu<HTMLButtonElement>();

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
					onClick={handleOpen}
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
				<MenuItem
					selected={!activeMonitor}
					onClick={() => {
						dispatch(setActiveMonitor(null));
						handleClose();
					}}
				>
					Global
				</MenuItem>
				{connectedMonitors.map(({ id, nickname }) => (
					<MenuItem
						key={`monitor-item-${id}`}
						selected={activeMonitor?.id === id}
						onClick={() => {
							dispatch(setActiveMonitor(id));
							handleClose();
						}}
					>
						<ListItemText sx={{ textTransform: "uppercase" }} secondary={getFormattedMonitorId(id)}>
							<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
								{nickname}
							</Stack>
						</ListItemText>
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default MonitorSelect;

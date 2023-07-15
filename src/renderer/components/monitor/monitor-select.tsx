import React from "react";
import { Box, Button, ListItemIcon, ListItemText, ListSubheader, Menu, MenuItem, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setActiveMonitor } from "../../reducers/app";
import { ArrowDropDown, AutoAwesome, Monitor } from "@mui/icons-material";
import { GLOBAL } from "lumi-control";

const MonitorSelect = () => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
	const monitors = useAppSelector((state) => state.app.monitors.filter((monitor) => monitor.connected));
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
		<Box>
			<Button
				size={"small"}
				startIcon={<Monitor />}
				endIcon={<ArrowDropDown />}
				onClick={handleClick}
				sx={{
					px: 1,
				}}
			>
				<Typography variant={"button"} noWrap={true} maxWidth={license === "premium" ? 100 : 60} textAlign={"left"}>
					{activeMonitor?.nickname ?? GLOBAL}
				</Typography>
			</Button>
			<Menu
				PaperProps={{
					style: {
						minHeight: 150,
						minWidth: 150,
					},
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
				{monitors.map(({ id, name, nickname }, index) => (
					<MenuItem
						disabled={license === "free" ? index > 1 : null}
						key={`monitor-item-${id}`}
						selected={activeMonitor?.id === id}
						onClick={() => {
							dispatch(setActiveMonitor(id));
							setAnchorEl(null);
						}}
					>
						{license === "free" && index > 1 ? (
							<ListItemIcon>
								<AutoAwesome color={"warning"} />
							</ListItemIcon>
						) : null}
						<ListItemText sx={{ textTransform: "capitalize" }}>{nickname}</ListItemText>
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
};

export default MonitorSelect;

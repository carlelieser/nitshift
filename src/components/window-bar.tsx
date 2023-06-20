import React from "react";
import { alpha, Badge, Divider, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks";
import WindowButtons from "./window-buttons";
import MonitorSelect from "./monitor/monitor-select";
import { capitalize } from "lodash";
import moment from "moment";
import { AutoAwesome } from "@mui/icons-material";

const { default: icon } = require("../assets/img/icon.png");

const WindowBar = () => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const trialStartDate = useAppSelector((state) => state.app.trialStartDate);
	const mode = useAppSelector((state) => state.app.mode);
	const license = useAppSelector((state) => state.app.license);

	return (
		<Paper
			sx={{
				borderBottomRightRadius: 0,
				borderBottomLeftRadius: 0,
				position: "sticky",
				top: 0,
				zIndex: 20,
				backdropFilter: "blur(40px)",
				bgcolor: alpha(theme.palette.background.paper, 0.4),
				boxShadow: "none"
			}}
			elevation={4}
		>
			<Stack
				direction={"row"}
				alignItems={"center"}
				justifyContent={"space-between"}
				px={2}
				py={1}
				spacing={2}
				borderBottom={"1px solid rgba(255, 255, 255, 0.1)"}
			>
				<Tooltip
					title={
						<Typography>
							{capitalize(license)}
							{license === "trial" ? ` ends ${moment(trialStartDate).add(7, "days").fromNow()}` : null}
						</Typography>
					}
				>
					<Stack direction={"row"} alignItems={"center"} spacing={1.5}>
						<img src={icon} width={24} height={24} alt={"logo"} />
						<Badge
							badgeContent={
								license === "premium" ?
									<AutoAwesome sx={{ fontSize: 12, mt: 2, ml: 1 }} color={"warning"} /> : null
							}
						>
							<Typography variant={"h5"} fontWeight={"bold"}>
								Glimmr
							</Typography>
						</Badge>
					</Stack>
				</Tooltip>
				<Stack direction={"row"} alignItems={"center"} spacing={2}>
					<Divider orientation={"vertical"} flexItem />
					{mode === "compact" ? <MonitorSelect /> : null}
					<Divider orientation={"vertical"} flexItem />
				</Stack>
				<WindowButtons />
			</Stack>
		</Paper>
	);
};

export default WindowBar;

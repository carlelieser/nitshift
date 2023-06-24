import React from "react";
import { alpha, Badge, Box, Divider, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { useAppSelector } from "../hooks";
import WindowButtons from "./window-buttons";
import MonitorSelect from "./monitor/monitor-select";
import { capitalize } from "lodash";
import { AutoAwesome } from "@mui/icons-material";
import { dayjs } from "../../common/dayjs";
import { yellow } from "@mui/material/colors";
import shadows from "@mui/material/styles/shadows";

const icon = require("../../assets/img/icon.svg");

const WindowBar = () => {
	const theme = useTheme();
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
				boxShadow: "none",
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
							{license === "trial" ? ` ends ${dayjs(trialStartDate).add(7, "days").fromNow()}` : null}
						</Typography>
					}
				>
					<Stack direction={"row"} alignItems={"center"} spacing={1}>
						<Box width={24} height={24} sx={{ backgroundImage: `url("${icon}")`, backgroundSize: "cover" }} />
						<Badge
							anchorOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							badgeContent={
								license === "premium" ? (
									<AutoAwesome sx={{ fontSize: 12, mt: 3, ml: 2, color: yellow[500], shadow: shadows[8] }} />
								) : null
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

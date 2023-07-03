import React, { useEffect, useState } from "react";
import { AutoAwesome, Timer } from "@mui/icons-material";
import { Badge, Box, Button } from "@mui/material";
import { useAppSelector } from "../hooks";
import PremiumTooltip from "./premium-tooltip";
import ViewScheduleDialog from "./dialogs/view-schedule";
import { ipcRenderer } from "electron";

const ScheduleButton = () => {
	const [scheduleOpen, setScheduleOpen] = useState<boolean>(false);
	const hasFreeLicense = useAppSelector((state) => state.app.license === "free");

	const openScheduleDialog = () => setScheduleOpen(true);
	const closeScheduleDialog = () => setScheduleOpen(false);

	useEffect(() => {
		if (scheduleOpen) ipcRenderer.invoke("disable-auto-hide");
		else ipcRenderer.invoke("enable-auto-hide");
	}, [scheduleOpen]);

	return (
		<>
			<PremiumTooltip title={"Set a custom brightness schedule"}>
				<Box>
					<Button color={"inherit"} disabled={hasFreeLicense} size={"small"} startIcon={<Timer />} onClick={openScheduleDialog}>
						<Badge badgeContent={hasFreeLicense ? <AutoAwesome sx={{ fontSize: 12, ml: 2 }} color={"warning"} /> : null}>
							Schedule
						</Badge>
					</Button>
				</Box>
			</PremiumTooltip>
			<ViewScheduleDialog open={scheduleOpen} onClose={closeScheduleDialog} />
		</>
	);
};

export default ScheduleButton;

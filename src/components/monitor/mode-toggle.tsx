import React from "react";
import { Badge, Box, IconButton } from "@mui/material";
import { AutoAwesome, DonutLarge, DonutSmall } from "@mui/icons-material";
import { UIMonitor } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setMonitorMode } from "../../reducers/app";
import PremiumTooltip from "../premium-tooltip";

interface MonitorModeToggleProps {
	monitorId: string;
	mode: UIMonitor["mode"];
}

const MonitorModeToggle: React.FC<MonitorModeToggleProps> = ({ monitorId, mode }) => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
	return (
		<PremiumTooltip title={mode === "native" ? "Use shade mode" : "Use native mode"}>
			<Box>
				<IconButton
					disabled={license === "free"}
					color={"inherit"}
					onClick={() =>
						dispatch(
							setMonitorMode({
								id: monitorId,
								mode: mode === "native" ? "shade" : "native",
							})
						)
					}
				>
					<Badge badgeContent={license === "free" ? <AutoAwesome sx={{ fontSize: 12 }} color={"warning"} /> : null}>
						{mode === "native" ? <DonutSmall /> : <DonutLarge />}
					</Badge>
				</IconButton>
			</Box>
		</PremiumTooltip>
	);
};

export default MonitorModeToggle;

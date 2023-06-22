import React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { RadioButtonUnchecked, TaskAlt } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setMonitorDisabled } from "../../reducers/app";

interface MonitorToggleProps {
	monitorId: string;
	disabled: boolean;
}

const MonitorToggle: React.FC<MonitorToggleProps> = ({ monitorId, disabled }) => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
	return license === "free" ? null : (
		<Tooltip title={<Typography>{disabled ? "Enable" : "Disable"}</Typography>}>
			<IconButton
				color={"inherit"}
				onClick={() =>
					dispatch(
						setMonitorDisabled({
							id: monitorId,
							disabled: !disabled,
						})
					)
				}
			>
				{!disabled ? <TaskAlt /> : <RadioButtonUnchecked />}
			</IconButton>
		</Tooltip>
	);
};

export default MonitorToggle;

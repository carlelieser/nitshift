import React from "react";
import { ButtonProps, Tooltip, Typography } from "@mui/material";
import { StarRoundedFilled } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setTrialStartDate } from "@reducers/app";
import ColorButton from "@buttons/color-button";

const FreeTrialButton: React.FC<Partial<ButtonProps>> = (props) => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
	const trialAvailable = useAppSelector((state) => state.app.trialAvailability);
	const startFreeTrial = () => dispatch(setTrialStartDate(Date.now()));

	return license === "free" && trialAvailable ? (
		<Tooltip
			title={
				<Typography>
					Start your 7-day free trial. All premium features will be enabled during this time.
				</Typography>
			}
		>
			<ColorButton colour={"indigo.500"} startIcon={<StarRoundedFilled />} onClick={startFreeTrial} {...props}>
				<Typography variant={"button"}>Start free trial</Typography>
			</ColorButton>
		</Tooltip>
	) : null;
};

export default FreeTrialButton;

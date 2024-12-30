import React from "react";
import { Tooltip, Typography } from "@mui/material";
import { StarRoundedFilled } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setTrialStartDate } from "@reducers/app";
import ThemeButton from "@renderer/components/buttons/theme-button";
import { ColorButtonProps } from "../../buttons/color-button";

const FreeTrialButton: React.FC<Partial<ColorButtonProps>> = (props) => {
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
			<ThemeButton
				variant={"contained"}
				disableElevation={true}
				startIcon={<StarRoundedFilled />}
				onClick={startFreeTrial}
				{...props}
			>
				Try for Free
			</ThemeButton>
		</Tooltip>
	) : null;
};

export default FreeTrialButton;

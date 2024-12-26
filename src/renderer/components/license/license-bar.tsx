import React from "react";
import { Paper, Stack } from "@mui/material";
import FreeTrialButton from "@promotional/buttons/free-trial-button";
import UpgradeButton from "@promotional/buttons/upgrade-button";
import { useAppSelector } from "@hooks";
import { maskStyles } from "../../utils";

const LicenseBar = () => {
	const license = useAppSelector((state) => state.app.license);
	return license === "premium" ? null : (
		<Paper elevation={0} variant={"elevation"} square={true} sx={{
			flexShrink: 0,
			display: "flex",
			width: "100%",
			borderRadius: 4,
			overflow: "hidden",
			position: "absolute",
			bottom: 0,
		}} style={maskStyles}>
			<Stack direction={"row"} justifyContent={"space-between"} width={"100%"} height={50}>
				<FreeTrialButton fullWidth={true} sx={{ borderRadius: 0 }} />
				<UpgradeButton context={"main"} fullWidth={true} sx={{ borderRadius: 0 }} />
			</Stack>
		</Paper>
	);
};

export default LicenseBar;

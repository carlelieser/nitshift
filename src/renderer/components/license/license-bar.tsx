import React from "react";
import { Paper, Stack } from "@mui/material";
import FreeTrialButton from "@promotional/buttons/free-trial-button";
import UpgradeButton from "@promotional/buttons/upgrade-button";
import { useAppSelector } from "@hooks";

const LicenseBar = () => {
	const license = useAppSelector((state) => state.app.license);
	return license === "premium" ? null : (
		<Paper
			elevation={0}
			variant={"elevation"}
			square={true}
			sx={{
				flexShrink: 0,
				display: "flex",
				width: "100%",
				position: "absolute",
				backgroundColor: "transparent",
				bottom: 0
			}}
		>
			<Stack
				direction={"row"}
				justifyContent={"space-between"}
				width={"100%"}
				height={50}
				sx={{ overflow: "hidden", borderRadius: 4, border: "1px solid inherit" }}
			>
				<FreeTrialButton fullWidth={true} sx={{ borderRadius: 0 }} />
				<UpgradeButton context={"main"} fullWidth={true} sx={{ borderRadius: 0 }} />
			</Stack>
		</Paper>
	);
};

export default LicenseBar;

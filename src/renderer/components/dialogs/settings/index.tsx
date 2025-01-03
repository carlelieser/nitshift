import Dialog, { DialogComponentProps } from "../../dialog";
import { Divider, Stack } from "@mui/material";
import React, { lazy, Suspense } from "react";
import { SettingsRoundedFilled } from "mui-symbols";
import Upgrade from "@promotional/buttons/upgrade-button";
import LicenseCard from "@components/license/license-card";

const Refresh = lazy(() => import("./options/refresh"));
const BrightnessSettings = lazy(() => import("./options/brightness/brightness-settings"));
const Appearance = lazy(() => import("./options/appearance"));
const Startup = lazy(() => import("./options/startup/startup"));
const AutoUpdateCheck = lazy(() => import("./options/auto-update-check"));
const Footer = lazy(() => import("./footer"));

const ViewSettings: React.FC<DialogComponentProps> = ({ open, onClose }) => {
	return (
		<Dialog title={"Settings"} icon={<SettingsRoundedFilled />} open={open} onClose={onClose}>
			<Stack spacing={3}>
				<Stack spacing={2} p={2}>
					<Upgrade context={"main"} fullWidth={true} sx={{ borderRadius: 9 }} />
					<Suspense>
						<Appearance />
						<BrightnessSettings />
						<Refresh />
						<AutoUpdateCheck />
						<Startup />
					</Suspense>
					<LicenseCard />
				</Stack>
				<Divider />
				<Footer />
			</Stack>
		</Dialog>
	);
};
export default ViewSettings;

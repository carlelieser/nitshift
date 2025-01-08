import Dialog, { DialogComponentProps } from "../../dialog";
import { Divider, Stack } from "@mui/material";
import React from "react";
import { SettingsRoundedFilled } from "mui-symbols";
import Upgrade from "@promotional/buttons/upgrade-button";
import LicenseCard from "@components/license/license-card";
import AutoResize from "./options/AutoResize";
import BrightnessSettings from "./options/brightness/brightness-settings";
import Refresh from "./options/refresh";
import AutoUpdateCheck from "./options/auto-update-check";
import Appearance from "./options/appearance";
import Startup from "./options/startup/startup";
import Footer from "./footer";

const ViewSettings: React.FC<DialogComponentProps> = ({ open, onClose }) => {
	return (
		<Dialog title={"Settings"} icon={<SettingsRoundedFilled />} open={open} onClose={onClose}>
			<Stack spacing={3}>
				<Stack spacing={2} p={2}>
					<Upgrade context={"main"} fullWidth={true} sx={{ borderRadius: 9 }} />
					<BrightnessSettings />
					<Appearance />
					<AutoResize />
					<Refresh />
					<AutoUpdateCheck />
					<Startup />
					<LicenseCard />
				</Stack>
				<Divider />
				<Footer />
			</Stack>
		</Dialog>
	);
};
export default ViewSettings;

import { Button, ButtonGroup, Stack, Typography } from "@mui/material";
import ReviewButton from "@buttons/review-button";
import ReportBugButton from "@buttons/report-bug-button";
import EmailUsButton from "@buttons/email-us-button";
import { version } from "@common/version";
import { isDev } from "@common/utils";
import { ipcRenderer } from "electron";
import { Update } from "mui-symbols";

const Footer = () => {
	const handleCheckForUpdates = () => {
		ipcRenderer.send("app/check-for-updates");
	};

	return (
		<Stack spacing={2} p={2} direction={"column"}>
			<ButtonGroup fullWidth={true} variant={"outlined"} size={"small"}>
				<ReportBugButton />
				<ReviewButton />
				<EmailUsButton />
			</ButtonGroup>
			<Stack direction={"row"} width={"100%"} alignItems={"center"} justifyContent={"space-between"}>
				<Typography variant={"caption"} color={"text.secondary"} textTransform={"uppercase"}>
					Glimmr {isDev ? "DEV" : ""} {version}
				</Typography>
				<Button startIcon={<Update />} size={"small"} onClick={handleCheckForUpdates}>
					Check for Updates
				</Button>
			</Stack>
		</Stack>
	);
};

export default Footer;

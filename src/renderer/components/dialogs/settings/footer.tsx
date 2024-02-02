import { ButtonGroup, Stack, Typography } from "@mui/material";
import ReviewButton from "@buttons/review-button";
import ReportABug from "@buttons/report-a-bug";
import EmailUs from "@buttons/email-us";
import release from "@common/release.json";
import { isDev } from "@common/utils";

const Footer = () => {
	return (
		<Stack spacing={2} p={2} direction={"column"} width={"100%"} alignItems={"center"} justifyContent={"center"}>
			<ButtonGroup variant={"outlined"} size={"small"}>
				<ReportABug />
				<ReviewButton />
				<EmailUs />
			</ButtonGroup>
			<Typography variant={"caption"} color={"text.secondary"} textTransform={"uppercase"}>
				Glimmr {isDev ? "DEV" : ""} {release.tag_name}
			</Typography>
		</Stack>
	);
};

export default Footer;

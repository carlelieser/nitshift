import React, { useMemo, useState } from "react";
import { Avatar, Chip, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { Key, License } from "mui-symbols";
import { dayjs } from "@common/dayjs";
import { useAppSelector } from "@hooks";
import ActivateLicenseDialog from "../dialogs/activate-license";
import ColorButton from "../buttons/color-button";
import FreeTrialButton from "../promotional/buttons/free-trial-button";
import Upgrade from "../promotional/buttons/upgrade-button";

const LicenseCard = () => {
	const license = useAppSelector((state) => state.app.license);
	const trialStart = useAppSelector((state) => state.app.trialStartDate);
	const theme = useTheme();
	const iconBackgroundColor = useMemo(
		() => (license !== "premium" ? theme.palette.background.paper : theme.palette.primary.main),
		[license, theme.palette.background.paper, theme.palette.primary.main]
	);
	const iconColor = useMemo(() => theme.palette.getContrastText(iconBackgroundColor), [iconBackgroundColor]);

	const [activationDialogOpen, setActivationDialogOpen] = useState<boolean>(false);

	const trialDaysLeft = useMemo(() => {
		const trialStartDate = dayjs(trialStart);
		const trialEndDate = trialStartDate.add(7, "days");
		return trialEndDate.diff(trialStartDate, "days");
	}, [trialStart]);

	const openActivationDialog = () => setActivationDialogOpen(true);
	const closeActivationDialog = () => setActivationDialogOpen(false);

	return (
		<Paper
			sx={{
				borderRadius: 4,
				position: "relative",
				overflow: "hidden",
				p: 1
			}}
			elevation={2}
		>
			<Stack borderRadius={3} p={2} gap={2} zIndex={20} position={"relative"}>
				<ActivateLicenseDialog open={activationDialogOpen} onClose={closeActivationDialog} />
				<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
					<Stack>
						<Stack direction={"row"} alignItems={"center"} gap={1}>
							<Typography variant={"overline"} sx={{ opacity: 0.7 }}>
								Current membership
							</Typography>
						</Stack>
						<Stack direction={"row"} alignItems={"center"} gap={1} mt={-1}>
							<Typography fontWeight={"medium"} textTransform={"capitalize"}>
								{license} License
							</Typography>
						</Stack>
					</Stack>
					{license === "trial" ? (
						<Chip size={"small"} label={`${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`} />
					) : null}
					<Avatar
						sx={{
							bgcolor: iconBackgroundColor,
							color: iconColor
						}}
					>
						<License />
					</Avatar>
				</Stack>
				{license !== "premium" ? (
					<Stack direction={"row"} alignItems={"center"} justifyContent={"center"} gap={2} flexWrap={"wrap"}>
						<Upgrade size={"small"} colour={"teal.500"} context={"main"} sx={{ px: 2, borderRadius: 10 }} />
						<FreeTrialButton size={"small"} colour={"teal.500"} sx={{ px: 2, borderRadius: 10 }} />
						<Tooltip title={<Typography>Activate a lifetime license with your email address</Typography>}>
							<ColorButton
								size={"small"}
								colour={"teal.500"}
								sx={{ borderRadius: 999, px: 2 }}
								startIcon={<Key />}
								onClick={openActivationDialog}
							>
								Activate
							</ColorButton>
						</Tooltip>
					</Stack>
				) : null}
			</Stack>
		</Paper>
	);
};

export default LicenseCard;

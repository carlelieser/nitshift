import React, { useMemo, useState } from "react";
import { alpha, Box, Chip, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { Key, License } from "mui-symbols";
import { dayjs } from "@common/dayjs";
import { useAppSelector } from "@hooks";
import ActivateLicenseDialog from "../dialogs/activate-license";
import ColorButton from "../buttons/color-button";
import { common, teal } from "@mui/material/colors";

import leatherTexture from "@assets/img/leather-texture.png";

const LicenseCard = () => {
	const license = useAppSelector((state) => state.app.license);
	const trialStart = useAppSelector((state) => state.app.trialStartDate);
	const appearance = useAppSelector((state) => state.app.appearance);

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
			variant={"outlined"}
			sx={{
				borderRadius: 4,
				bgcolor: appearance === "light" ? "primary.main" : "background.paper",
				color: appearance === "light" ? "white" : "inherit",
				position: "relative",
				overflow: "hidden",
				p: 1,
			}}
		>
			<Box
				border={`2px dashed ${alpha(appearance === "light" ? common.white : teal[500], 0.8)}`}
				borderRadius={3}
				p={2}
				zIndex={20}
				position={"relative"}
			>
				<ActivateLicenseDialog open={activationDialogOpen} onClose={closeActivationDialog} />
				<Stack p={2} spacing={2} alignItems={"center"} justifyContent={"center"}>
					<Stack
						bgcolor={appearance === "light" ? "common.white" : "primary.main"}
						color={appearance === "light" ? "primary.main" : "primary.contrastText"}
						borderRadius={"100%"}
						width={48}
						height={48}
						alignItems={"center"}
						justifyContent={"center"}
					>
						<License />
					</Stack>
					<Stack direction={"row"} alignItems={"center"} justifyContent={"center"} gap={2} flexWrap={"wrap"}>
						<Chip
							label={
								<Stack spacing={0.5} direction={"row"}>
									<Typography sx={{ opacity: 0.7 }}>License</Typography>
									<Typography textTransform={"capitalize"}>{license}</Typography>
								</Stack>
							}
						></Chip>
						{license === "trial" ? (
							<Chip
								label={
									<Typography>
										{trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
									</Typography>
								}
							></Chip>
						) : null}
						{license === "premium" ? null : (
							<Tooltip title={<Typography>Activate license</Typography>}>
								<ColorButton
									colour={appearance === "light" ? "teal.900" : "blue.500"}
									size={"small"}
									sx={{ borderRadius: 999, px: 2 }}
									startIcon={<Key />}
									onClick={openActivationDialog}
								>
									Activate
								</ColorButton>
							</Tooltip>
						)}
					</Stack>
				</Stack>
			</Box>
			<img
				src={leatherTexture}
				style={{
					top: 0,
					left: 0,
					position: "absolute",
					zIndex: 0,
					opacity: 0.2,
				}}
			/>
		</Paper>
	);
};

export default LicenseCard;

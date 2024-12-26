import React from "react";
import { Alert, alpha, Avatar, Grid, Paper, Stack, StackProps, Typography } from "@mui/material";
import { DonutSmall, FeaturedSeasonalAndGiftsRoundedFilled, Monitor, Schedule, WbSunny } from "mui-symbols";
import { amber, yellow } from "@mui/material/colors";

const content = [
	{
		icon: Monitor,
		title: "Unlimited Monitors",
		subtitle: "Adjust as many monitors as you want, without limits."
	},
	{
		icon: WbSunny,
		title: "Global Brightness",
		subtitle:
			"Effortlessly adjust the brightness of all connected displays with a single slider – perfect for simultaneous dimming of multiple monitors."
	},
	{
		icon: DonutSmall,
		title: "Shade Mode",
		subtitle: "Artificially adjust brightness for monitors that don't natively support it."
	},
	{
		icon: Schedule,
		title: "Schedule",
		subtitle: "Set brightness levels for different monitors at specific times."
	},
	{
		icon: FeaturedSeasonalAndGiftsRoundedFilled,
		title: "Show Your Support",
		subtitle: "Glimmr was made with love. (And a lot of coffee.) Support the developer and help keep the project alive."
	}
];

const FeatureList: React.FC<StackProps> = (props) => {
	return (
		<Stack sx={{ overflowX: "hidden" }} gap={2} pb={2} {...props}>
			<Alert sx={{ zIndex: 10 }} elevation={4} square={true} severity={"info"}>
				Gain access to all current and upcoming pro features on all your devices with a single lifetime license.
			</Alert>
			<Grid container={true} gap={2} flex={1}>
				{content.map((feature) => {
					const Icon = feature.icon;
					return (
						<Grid item={true} xs={12} key={feature.title}>
							<Paper
								sx={{
									p: 2,
									position: "relative"
								}}
								square={true}
								variant={"elevation"}
								elevation={0}
							>
								<Stack spacing={1}>
									<Stack direction={"row"} spacing={2}>
										<Avatar
											sx={{
												width: 48,
												height: 48,
												bgcolor: alpha(yellow[900], 0.2),
												color: amber[700]
											}}
										>
											<Icon />
										</Avatar>
										<Stack spacing={1}>
											<Typography variant={"h6"} fontWeight={500} lineHeight={1}>
												{feature.title}
											</Typography>
											<Typography variant={"body1"} width={"100%"} sx={{ opacity: 0.8 }}>
												{feature.subtitle}
											</Typography>
										</Stack>
									</Stack>
								</Stack>
							</Paper>
						</Grid>
					);
				})}
			</Grid>
		</Stack>
	);
};

export default FeatureList;

import React, { lazy, Suspense, useMemo } from "react";
import { alpha, Box, Divider, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { useAppSelector } from "@hooks";
import { capitalize } from "lodash";
import icon from "@assets/img/icon.svg";
import release from "@common/release.json";
import { teal } from "@mui/material/colors";

const WindowButtons = lazy(() => import("./buttons/window-buttons"));
const MonitorSelect = lazy(() => import("./monitor/monitor-select"));

const WindowBar = () => {
	const theme = useTheme();
	const mode = useAppSelector((state) => state.app.mode);
	const appearance = useAppSelector((state) => state.app.appearance);
	const license = useAppSelector((state) => state.app.license);

	const bgcolor = useMemo(
		() =>
			alpha(
				appearance === "light" ? teal[100] : theme.palette.background.paper,
				appearance === "light" ? 1 : 0.4
			),
		[appearance, theme]
	);

	const color = useMemo(() => theme.palette.getContrastText(bgcolor), [bgcolor]);

	return (
		<Paper
			sx={{
				position: "sticky",
				top: 0,
				zIndex: 20,
				backdropFilter: "blur(40px)",
				bgcolor,
				color
			}}
			variant={"elevation"}
			elevation={appearance === "light" ? 0 : 2}
			square={true}
		>
			<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} px={2} py={1} spacing={2}>
				<Tooltip
					title={
						<Typography>
							Glimmr {release.tag_name} · {capitalize(license)}
						</Typography>
					}
				>
					<Stack direction={"row"} alignItems={"center"} spacing={1}>
						<Box
							width={24}
							height={24}
							sx={{ backgroundImage: `url("${icon}")`, backgroundSize: "cover" }}
						/>
						{mode === "expanded" ? (
							<Typography variant={"h5"} fontWeight={"bold"}>
								Glimmr
							</Typography>
						) : null}
					</Stack>
				</Tooltip>
				<Suspense>
					<Stack direction={"row"} alignItems={"center"} width={"100%"} spacing={2}>
						<Divider orientation={"vertical"} flexItem />
						{mode === "compact" ? <MonitorSelect /> : null}
						<Divider orientation={"vertical"} flexItem />
					</Stack>
					<WindowButtons />
				</Suspense>
			</Stack>
		</Paper>
	);
};

export default WindowBar;

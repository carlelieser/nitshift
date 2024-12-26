import React, { lazy, Suspense, useMemo } from "react";
import { alpha, Box, Divider, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { useAppSelector } from "@hooks";
import { capitalize } from "lodash";
import icon from "@assets/img/icon.svg";
import release from "@common/release.json";

const WindowButtons = lazy(() => import("./buttons/window-buttons"));
const MonitorSelect = lazy(() => import("./monitor/monitor-select"));

const WindowBar = () => {
	const theme = useTheme();
	const mode = useAppSelector((state) => state.app.mode);
	const license = useAppSelector((state) => state.app.license);
	const isNative = useAppSelector((state) => state.app.native);

	const bgcolor = useMemo(
		() => alpha(theme.palette.background.paper, isNative ? 0.71 : 1),
		[isNative, theme.palette.background.paper]
	);

	const color = useMemo(() => theme.palette.getContrastText(bgcolor), [bgcolor]);

	return (
		<Paper
			sx={{
				position: "sticky",
				top: 0,
				zIndex: 20,
				bgcolor,
				color,
			}}
			variant={"elevation"}
			elevation={0}
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

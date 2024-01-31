import React, { lazy, Suspense, useEffect, useState } from "react";
import { Box, Paper, Slide, Stack, ThemeProvider } from "@mui/material";
import { batch, Provider } from "react-redux";
import { redux } from "@redux";
import { useAppDispatch, useAppSelector, useAppTheme } from "@hooks";
import {
	refreshAvailableMonitors,
	setFocused,
	setLicense,
	setTransitioning,
	setTrialStartDate,
	syncLicenseData,
} from "@reducers/app";
import { dimensions, isNumberAroundReference } from "@common/utils";
import FocusTrap from "@mui/material/Unstable_TrapFocus";
import WindowBar from "@components/window-bar";

import { ipcRenderer } from "electron";
import { maskStyles } from "./utils";
import PassThrough from "@components/pass-through";
import MonitorsRefreshed from "@components/monitors-refreshed";
import ReceivedPremium from "@components/received-premium";
import { setRelease } from "./reducers/app";
import UpdateSnackbar from "@components/update-snackbar";

const ExpandedView = lazy(() => import("./views/expanded"));
const CompactView = lazy(() => import("./views/compact"));

const App = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => state.app.mode);
	const transitioning = useAppSelector((state) => state.app.transitioning);

	const [firstTransition, setFirstTransition] = useState<boolean>(true);
	const focused = useAppSelector((state) => state.app.focused);

	const theme = useAppTheme();

	const handleMouseOver: React.MouseEventHandler<HTMLDivElement> = (e) => {
		const target = e.target as HTMLDivElement;
		if (target.id === "click-through-container" || target.dataset.enablePassThrough || transitioning) {
			ipcRenderer.invoke("app/pass-through/enable");
		} else {
			ipcRenderer.invoke("app/pass-through/disable");
		}
	};

	const handleWindowResize = () => {
		if (transitioning) {
			const nextMode = mode === "compact" ? "expanded" : "compact";
			const [width, height] = ipcRenderer.sendSync("app/window/size");
			if (
				isNumberAroundReference(width, dimensions[nextMode].width, 5) &&
				isNumberAroundReference(height, dimensions[nextMode].height, 5)
			) {
				dispatch(setTransitioning(false));
			}
		}
	};

	useEffect(() => {
		window.addEventListener("resize", handleWindowResize);
		if (!transitioning) ipcRenderer.invoke("app/pass-through/disable");

		return () => {
			window.removeEventListener("resize", handleWindowResize);
		};
	}, [transitioning]);

	useEffect(() => {
		ipcRenderer.on("sync-license", () => {
			batch(() => {
				dispatch(syncLicenseData());
				dispatch(refreshAvailableMonitors());
			});
		});

		ipcRenderer.on("trial-ended", () => {
			batch(() => {
				dispatch(setTrialStartDate(null));
				dispatch(setLicense("free"));
			});
		});

		ipcRenderer.on("display-arrangement-changed", () => dispatch(refreshAvailableMonitors()));
		ipcRenderer.on("refresh-monitors", () => dispatch(refreshAvailableMonitors()));

		ipcRenderer.on("focused", () => dispatch(setFocused(true)));
		ipcRenderer.on("blurred", () => dispatch(setFocused(false)));

		ipcRenderer.on("update-available", (_event, release) => dispatch(setRelease(release)));

		if (process.env.CAPTURE) {
			window.addEventListener("keyup", (e) => {
				if (e.keyCode === 48) {
					e.stopPropagation();
					e.preventDefault();
					ipcRenderer.invoke("app/screenshot");
					return false;
				}
			});
		}
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<FocusTrap open={transitioning}>
				<div
					id={"click-through-container"}
					style={{
						width: "100%",
						height: "100%",
						position: "relative",
						overflow: "hidden",
					}}
					onMouseOver={handleMouseOver}
				>
					{process.env.CAPTURE ? <style>{"body { zoom: 2; }"}</style> : null}
					<Slide
						direction={"up"}
						in={transitioning ? !transitioning : focused}
						appear={false}
						mountOnEnter={true}
						unmountOnExit={true}
						timeout={148}
						style={{
							transitionDelay: `${firstTransition ? 500 : 0}ms`,
						}}
						onExited={() => {
							setFirstTransition(false);
							if (!focused) ipcRenderer.invoke("app/window/minimize");
						}}
					>
						<Box p={2} position={"relative"} width={"100%"} height={"100%"}>
							<MonitorsRefreshed />
							<ReceivedPremium />
							<UpdateSnackbar />
							<Stack height={"100%"} justifyContent={"end"}>
								<PassThrough />
								<Paper
									sx={{
										borderRadius: 4,
										mt: "auto",
										height: mode === "compact" ? "auto" : "100%",
									}}
									variant={"elevation"}
									elevation={8}
								>
									<Paper
										sx={{
											borderRadius: 4,
											height: "100%",
											overflow: "hidden",
											position: "relative",
										}}
										style={maskStyles}
										variant={"outlined"}
										elevation={0}
									>
										<Paper
											sx={{
												borderRadius: 4,
												height: "100%",
												display: "flex",
												flexDirection: "column",
												position: "relative",
											}}
											variant={"elevation"}
											elevation={0}
										>
											<WindowBar />
											<Suspense>
												<ExpandedView />
												<CompactView />
											</Suspense>
										</Paper>
									</Paper>
								</Paper>
							</Stack>
						</Box>
					</Slide>
				</div>
			</FocusTrap>
		</ThemeProvider>
	);
};

export default () => (
	<Provider store={redux}>
		<App />
	</Provider>
);

import React, { CSSProperties, useCallback, useEffect, useMemo } from "react";
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
	syncLicenseData
} from "@reducers/app";
import { dimensions, isNumberAroundReference } from "@common/utils";
import FocusTrap from "@mui/material/Unstable_TrapFocus";

import { ipcRenderer } from "electron";
import { setAppearance, setRelease } from "./reducers/app";
import { Appearance } from "../common/types";
import UpdateSnackbar from "./components/update-snackbar";
import MonitorsRefreshed from "./components/monitors-refreshed";
import PassThrough from "./components/pass-through";
import WindowBar from "./components/window-bar";
import ExpandedView from "./views/expanded";
import CompactView from "./views/compact";
import ReceivedPremium from "./components/received-premium";

const App = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => state.app.mode);
	const transitioning = useAppSelector((state) => state.app.transitioning);

	const focused = useAppSelector((state) => state.app.focused);

	const theme = useAppTheme();

	const handleMouseOver: React.MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const target = e.target as HTMLDivElement;
			if (target.id === "click-through-container" || target.dataset.enablePassThrough || transitioning) {
				ipcRenderer.invoke("app/pass-through/enable");
			} else {
				ipcRenderer.invoke("app/pass-through/disable");
			}
		},
		[transitioning]
	);

	const handleWindowResize = useCallback(async () => {
		if (transitioning) {
			const nextMode = mode === "compact" ? "expanded" : "compact";
			const [width, height] = await ipcRenderer.invoke("app/window/size");
			if (
				isNumberAroundReference(width, dimensions[nextMode].native?.width, 5) &&
				isNumberAroundReference(height, dimensions[nextMode].native?.height, 5)
			) {
				dispatch(setTransitioning(false));
			}
		}
	}, [transitioning, mode, dispatch]);

	useEffect(() => {
		window.addEventListener("resize", handleWindowResize);
		if (!transitioning) ipcRenderer.invoke("app/pass-through/disable");

		return () => {
			window.removeEventListener("resize", handleWindowResize);
		};
	}, [transitioning]);

	useEffect(() => {
		ipcRenderer.on("appearance-updated", (_, appearance: Appearance) => {
			dispatch(setAppearance(appearance));
		});

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

		ipcRenderer.send("app/renderer/ready");
	}, []);

	const clickThroughContainerStyle = useMemo<CSSProperties>(
		() => ({
			width: "100%",
			height: "100%",
			position: "relative"
		}),
		[]
	);

	const renderCapture = useCallback(() => (process.env.CAPTURE ? <style>{"body { zoom: 2; }"}</style> : null), []);

	const transitionIn = useMemo(() => (transitioning ? !transitioning : focused), [transitioning, focused]);

	const handleTransitionExited = useCallback(() => {
		if (!focused) ipcRenderer.invoke("app/window/minimize");
	}, [focused]);

	return (
		<ThemeProvider theme={theme}>
			<FocusTrap open={transitioning}>
				<div id={"click-through-container"} style={clickThroughContainerStyle} onMouseOver={handleMouseOver}>
					{renderCapture()}
					<Slide
						direction={"up"}
						in={transitionIn}
						appear={false}
						mountOnEnter={true}
						unmountOnExit={true}
						onExited={handleTransitionExited}
					>
						<Box p={2} position={"relative"} width={"100%"} height={"100%"}>
							<MonitorsRefreshed />
							<ReceivedPremium />
							<UpdateSnackbar />
							<Stack height={"100%"} justifyContent={"end"}>
								<PassThrough />
								<Box
									sx={{
										mt: "auto",
										height: mode === "compact" ? "auto" : "100%"
									}}
								>
									<Box
										sx={{
											height: "100%",
											position: "relative"
										}}
									>
										<Paper
											sx={{
												height: "100%",
												display: "flex",
												flexDirection: "column",
												zIndex: 10,
												borderRadius: 4,
												overflow: "hidden"
											}}
											variant={"elevation"}
											elevation={1}
										>
											<WindowBar />
											<ExpandedView />
											<CompactView />
										</Paper>
									</Box>
								</Box>
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

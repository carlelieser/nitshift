import React, { CSSProperties, lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
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
import { isDev } from "../common/utils";
import { Appearance } from "../common/types";

const WindowBar = lazy(() => import("@components/window-bar"));
const ExpandedView = lazy(() => import("./views/expanded"));
const CompactView = lazy(() => import("./views/compact"));
const PassThrough = lazy(() => import("@components/pass-through"));
const MonitorsRefreshed = lazy(() => import("@components/monitors-refreshed"));
const ReceivedPremium = lazy(() => import("@components/received-premium"));
const UpdateSnackbar = lazy(() => import("@components/update-snackbar"));

const App = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => state.app.mode);
	const transitioning = useAppSelector((state) => state.app.transitioning);

	const [firstTransition, setFirstTransition] = useState<boolean>(true);
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

		if (!isDev) ipcRenderer.on("blurred", () => dispatch(setFocused(false)));

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
			position: "relative",
			overflow: "hidden"
		}),
		[]
	);

	const renderCapture = useCallback(() => (process.env.CAPTURE ? <style>{"body { zoom: 2; }"}</style> : null), []);

	const transitionIn = useMemo(() => (transitioning ? !transitioning : focused), [transitioning, focused]);
	const transitionDelay = useMemo(
		() => ({
			transitionDelay: `${firstTransition ? 500 : 0}ms`
		}),
		[firstTransition]
	);

	const handleTransitionExited = useCallback(() => {
		setFirstTransition(false);
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
						timeout={148}
						style={transitionDelay}
						onExited={handleTransitionExited}
					>
						<Box p={2} position={"relative"} width={"100%"} height={"100%"} sx={{ overflow: "hidden" }}>
							<Suspense>
								<MonitorsRefreshed />
								<ReceivedPremium />
								<UpdateSnackbar />
								<Stack height={"100%"} justifyContent={"end"}>
									<PassThrough />
									<Box
										sx={{
											mt: "auto",
											height: mode === "compact" ? "auto" : "100%",
											overflow: "hidden"
										}}
									>
										<Box
											sx={{
												height: "100%",
												overflow: "hidden",
												position: "relative"
											}}
										>
											<Paper
												sx={{
													height: "100%",
													display: "flex",
													flexDirection: "column",
													overflow: "hidden",
													zIndex: 10,
													borderRadius: 4
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
							</Suspense>
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

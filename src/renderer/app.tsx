import React, { useEffect, useMemo, useState } from "react";
import { Box, createTheme, Grow, Portal, Snackbar, ThemeProvider } from "@mui/material";
import { ipcRenderer } from "electron";
import { Provider } from "react-redux";
import { redux } from "./redux";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
	refreshAvailableMonitors,
	setLicense,
	setReceivedPremium,
	setRefreshed,
	setTransitioning,
	setTrialStartDate,
	syncLicenseData,
} from "./reducers/app";
import { teal } from "@mui/material/colors";

import ExpandedView from "./views/expanded";
import CompactView from "./views/compact";
import { Release } from "../main/updater";
import shadows from "@mui/material/styles/shadows";
import UpdateSnackbar from "./components/update-snackbar";
import { dimensions } from "../main/window";
import { isNumberAroundReference } from "../common/utils";
import FocusTrap from "@mui/material/Unstable_TrapFocus";

const App = () => {
	const dispatch = useAppDispatch();
	const refreshed = useAppSelector((state) => state.app.refreshed);
	const receivedPremium = useAppSelector((state) => state.app.receivedPremium);
	const mode = useAppSelector((state) => state.app.mode);
	const transitioning = useAppSelector((state) => state.app.transitioning);

	const [release, setRelease] = useState<Release>(null);

	const [focused, setFocused] = useState<boolean>(true);

	const theme = useMemo(() => {
		return createTheme({
			palette: {
				mode: "dark",
				primary: teal,
				secondary: {
					main: "#ec407a",
				},
			},
			typography: {
				fontFamily: "roboto",
				h1: {
					fontFamily: "sofia-pro",
				},
				h4: {
					fontFamily: "sofia-pro",
				},
				h5: {
					fontFamily: "sofia-pro",
				},
				h6: {
					fontFamily: "sofia-pro",
				},
			},
			components: {
				MuiSnackbar: {
					defaultProps: {
						sx: {
							m: 2,
						},
						TransitionComponent: Grow,
					},
					styleOverrides: {
						root: {
							boxShadow: shadows[20],
						},
					},
				},
				MuiAlert: {
					styleOverrides: {
						message: {
							width: "100%",
						},
					},
				},
				MuiButton: {
					defaultProps: {
						sx: {
							px: 2,
						},
					},
					styleOverrides: {
						startIcon: {
							opacity: 0.7,
						},
					},
				},
				MuiTooltip: {
					defaultProps: {
						disableFocusListener: transitioning,
						disableHoverListener: transitioning,
						disableInteractive: true,
						PopperProps: {
							disablePortal: transitioning,
							hidden: transitioning,
						},
					},
				},
				MuiMenu: {
					defaultProps: {
						disableEnforceFocus: transitioning,
						disablePortal: transitioning,
						hidden: transitioning,
					},
				},
			},
		});
	}, [mode, transitioning]);

	const handleMouseOver: React.MouseEventHandler<HTMLDivElement> = (e) => {
		const target = e.target as HTMLDivElement;
		if (target.id === "click-through-container" || target.dataset.enablePassThrough || transitioning) {
			ipcRenderer.invoke("enable-pass-through");
		} else {
			ipcRenderer.invoke("disable-pass-through");
		}
	};

	const closeUpdateSnackbar = () => setRelease(null);

	const handleWindowResize = () => {
		if (transitioning) {
			const nextMode = mode === "compact" ? "expanded" : "compact";
			const [width, height] = ipcRenderer.sendSync("get-window-size");
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
		if (!transitioning) ipcRenderer.invoke("disable-pass-through");

		return () => {
			window.removeEventListener("resize", handleWindowResize);
		};
	}, [transitioning]);

	useEffect(() => {
		ipcRenderer.on("update-available", (e, release: Release) => {
			setRelease(release);
		});
		ipcRenderer.on("sync-license", () => {
			dispatch(syncLicenseData());
			dispatch(refreshAvailableMonitors());
		});
		ipcRenderer.on("trial-ended", () => {
			dispatch(setTrialStartDate(null));
			dispatch(setLicense("free"));
		});
		ipcRenderer.on("display-arrangement-changed", () => dispatch(refreshAvailableMonitors()));
		ipcRenderer.on("refresh-monitors", () => dispatch(refreshAvailableMonitors()));
		ipcRenderer.on("focused", () => setFocused(true));
		ipcRenderer.on("blurred", () => setFocused(false));
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<FocusTrap open={transitioning}>
				<div
					id={"click-through-container"}
					style={{
						opacity: transitioning ? 0 : 1,
						transition: "all .25s ease-in-out",
						width: "100%",
						height: "100%",
						position: "relative",
						backdropFilter: "blur(0)",
					}}
					onMouseOver={handleMouseOver}
				>
					<Grow
						in={transitioning ? !transitioning : focused}
						style={{
							transformOrigin: "bottom center",
						}}
						onExited={() => {
							if (!focused) ipcRenderer.invoke("minimize");
						}}
					>
						<Box p={2} position={"relative"} height={"100%"}>
							<UpdateSnackbar release={release} onClose={closeUpdateSnackbar} />
							<Snackbar
								open={mode === "expanded" && refreshed}
								autoHideDuration={2000}
								onClose={() => dispatch(setRefreshed(false))}
								message={"Refreshed"}
							/>
							<Portal>
								<Snackbar
									open={receivedPremium}
									autoHideDuration={6000}
									onClose={() => dispatch(setReceivedPremium(false))}
									message={
										"Thanks for verifying your license. Now you can kick back and enjoy all the premium features. Have fun!"
									}
								/>
							</Portal>
							<ExpandedView />
							<CompactView />
						</Box>
					</Grow>
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

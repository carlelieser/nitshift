import React, { useEffect, useMemo } from "react";
import { Box, createTheme, Grow, Portal, Snackbar, ThemeProvider } from "@mui/material";
import { ipcRenderer } from "electron";
import { Provider } from "react-redux";
import { redux } from "./redux";
import { useAppDispatch, useAppSelector } from "./hooks";
import { refreshAvailableMonitors, setLicense, setReceivedPremium, setRefreshed, setTrialStartDate, syncLicenseData } from "./reducers/app";
import { teal } from "@mui/material/colors";

import ExpandedView from "./views/expanded";
import CompactView from "./views/compact";

const App = () => {
	const dispatch = useAppDispatch();
	const refreshed = useAppSelector((state) => state.app.refreshed);
	const receivedPremium = useAppSelector((state) => state.app.receivedPremium);
	const mode = useAppSelector((state) => state.app.mode);
	const transitioning = useAppSelector((state) => state.app.transitioning);

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
						disableInteractive: true,
					},
				},
			},
		});
	}, [mode]);

	const handleMouseOver: React.MouseEventHandler<HTMLDivElement> = (e) => {
		const target = e.target as HTMLDivElement;
		if (target.id === "click-through-container" || target.dataset.enablePassThrough || transitioning) {
			ipcRenderer.invoke("enable-pass-through");
		} else {
			ipcRenderer.invoke("disable-pass-through");
		}
	};

	useEffect(() => {
		if (!transitioning) ipcRenderer.invoke("disable-pass-through");
	}, [transitioning]);

	useEffect(() => {
		ipcRenderer.on("sync-license", () => {
			dispatch(syncLicenseData());
			dispatch(refreshAvailableMonitors());
		});
		ipcRenderer.on("trial-ended", () => {
			dispatch(setTrialStartDate(null));
			dispatch(setLicense("free"));
		});
		ipcRenderer.on("display-arrangement-changed", () => dispatch(refreshAvailableMonitors()));
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<div
				id={"click-through-container"}
				style={{
					opacity: transitioning ? 0 : 1,
					transition: "all .25s ease-in-out",
					width: "100%",
					height: "100%",
					position: "relative",
				}}
				onMouseOver={handleMouseOver}
			>
				<Box p={2} position={"relative"} height={"100%"}>
					<Snackbar
						open={mode === "expanded" && refreshed}
						autoHideDuration={2000}
						TransitionComponent={Grow}
						onClose={() => dispatch(setRefreshed(false))}
						message={"Refreshed"}
						sx={{
							m: 3,
						}}
					/>
					<Portal>
						<Snackbar
							open={receivedPremium}
							autoHideDuration={6000}
							TransitionComponent={Grow}
							onClose={() => dispatch(setReceivedPremium(false))}
							message={
								"Thanks for verifying your license. Now you can kick back and enjoy all the premium features. Have fun!"
							}
							sx={{
								m: 3,
							}}
						/>
					</Portal>
					<ExpandedView />
					<CompactView />
				</Box>
			</div>
		</ThemeProvider>
	);
};

export default () => (
	<Provider store={redux}>
		<App />
	</Provider>
);

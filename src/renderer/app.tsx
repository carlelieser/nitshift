import React, {useEffect, useMemo, useState} from "react";
import {
    Box,
    createTheme,
    Grow,
    Portal,
    Snackbar,
    ThemeProvider,
} from "@mui/material";
import {ipcRenderer} from "electron";
import {Provider} from "react-redux";
import {redux} from "./redux";
import {useAppDispatch, useAppSelector} from "./hooks";
import {
    refreshAvailableMonitors,
    setLicense,
    setReceivedPremium,
    setRefreshed,
    setTrialStartDate,
    syncLicenseData
} from "./reducers/app";
import {teal} from "@mui/material/colors";

import ExpandedView from "./views/expanded";
import CompactView from "./views/compact";
import {Release} from "../main/updater";
import shadows from "@mui/material/styles/shadows";
import UpdateSnackbar from "./components/update-snackbar";

const App = () => {
    const dispatch = useAppDispatch();
    const refreshed = useAppSelector((state) => state.app.refreshed);
    const receivedPremium = useAppSelector((state) => state.app.receivedPremium);
    const mode = useAppSelector((state) => state.app.mode);
    const transitioning = useAppSelector((state) => state.app.transitioning);
    const [release, setRelease] = useState<Release>(null);

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
                            width: "100%"
                        }
                    }
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

    const closeUpdateSnackbar = () => setRelease(null);

    useEffect(() => {
        if (!transitioning) ipcRenderer.invoke("disable-pass-through");
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
                    <UpdateSnackbar release={release} onClose={closeUpdateSnackbar}/>
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
                    <ExpandedView/>
                    <CompactView/>
                </Box>
            </div>
        </ThemeProvider>
    );
};

export default () => (
    <Provider store={redux}>
        <App/>
    </Provider>
);

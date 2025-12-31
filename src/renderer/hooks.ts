import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "./redux";
import { AppState } from "../common/types";
import { useCallback, useMemo, useRef, useState } from "react";
import { createTheme, Grow } from "@mui/material";
import { teal } from "@mui/material/colors";
import shadows from "@mui/material/styles/shadows";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

// Selectors
export const selectActiveBrightnessMode = (state: AppState) =>
	state.app.brightnessModes.find((mode) => mode.active);

export const selectConnectedMonitors = (state: AppState) =>
	state.app.monitors.filter((monitor) => monitor.connected);

// Hook for simple open/close menu state with optional ref
export const useMenuState = <T extends HTMLElement = HTMLElement>() => {
	const [open, setOpen] = useState(false);
	const ref = useRef<T>(null);

	const openMenu = useCallback(() => setOpen(true), []);
	const closeMenu = useCallback(() => setOpen(false), []);

	return { open, ref, openMenu, closeMenu };
};

// Hook for anchor element-based menus (MUI Menu pattern)
export const useAnchorMenu = <T extends HTMLElement = HTMLElement>() => {
	const [anchorEl, setAnchorEl] = useState<T | null>(null);
	const open = Boolean(anchorEl);

	const handleOpen = useCallback((event: React.MouseEvent<T>) => {
		setAnchorEl(event.currentTarget);
	}, []);

	const handleClose = useCallback(() => {
		setAnchorEl(null);
	}, []);

	return { anchorEl, open, handleOpen, handleClose };
};

export const useAppTheme = () => {
	const appearance = useAppSelector((state) => state.app.appearance);
	const transitioning = useAppSelector((state) => state.app.transitioning);
	const mode = useAppSelector((state) => state.app.mode);
	const focused = useAppSelector((state) => state.app.focused);

	return useMemo(() => {
		const bg = appearance === "light" ? "#F1F5F2" : "#151515";
		return createTheme({
			palette: {
				mode: appearance,
				primary: teal,
				secondary: {
					main: "#ec407a"
				}
			},
			typography: {
				fontFamily: "roboto",
				button: {
					textTransform: "none",
					fontSize: "medium",
					fontWeight: 500
				},
				h1: {
					fontFamily: "sofia-pro"
				},
				h4: {
					fontFamily: "sofia-pro"
				},
				h5: {
					fontFamily: "sofia-pro"
				},
				h6: {
					fontFamily: "sofia-pro"
				}
			},
			components: {
				MuiSnackbar: {
					defaultProps: {
						sx: {
							m: 2
						},
						TransitionComponent: Grow,
						ContentProps: {
							variant: "elevation"
						}
					},
					styleOverrides: {
						root: {
							border: 0
						}
					}
				},
				MuiChip: {
					defaultProps: {
						sx: {
							color: "inherit"
						}
					}
				},
				MuiIconButton: {
					defaultProps: {
						disableFocusRipple: !!process.env.CAPTURE,
						color: "inherit"
					},
					styleOverrides: {
						root: {
							opacity: 0.9
						}
					}
				},
				MuiButton: {
					defaultProps: {
						disableFocusRipple: !!process.env.CAPTURE,
						color: appearance === "light" ? "inherit" : "primary"
					},
					styleOverrides: {
						root: {
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							px: 2
						}
					}
				},
				MuiTooltip: {
					defaultProps: {
						PopperProps: {
							hidden: transitioning ? true : undefined
						}
					}
				},
				MuiMenu: {
					defaultProps: {
						disableEnforceFocus: transitioning,
						disablePortal: transitioning,
						hidden: transitioning || !focused
					},
					styleOverrides: {
						paper: {
							border: "none",
							boxShadow: shadows[4]
						}
					}
				},
				MuiPaper: {
					defaultProps: {
						variant: appearance === "light" ? "outlined" : "elevation"
					},
					styleOverrides: {
						root: {
							backgroundColor: bg
						}
					}
				},
				MuiAlert: {
					styleOverrides: {
						message: {
							width: "100%"
						},
						root: {
							border: 0
						}
					}
				}
			}
		});
	}, [mode, appearance, transitioning, focused]);
};

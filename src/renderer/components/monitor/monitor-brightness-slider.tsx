import React, { useMemo } from "react";
import { setBrightness, setMonitorBrightness } from "@reducers/app";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { GLOBAL, UIMonitor } from "@common/types";
import { createTheme, SlideProps, Theme, ThemeProvider, useTheme } from "@mui/material";
import Slider from "@components/slider";
import { merge } from "lodash";
import Color from "color";
import { teal } from "@mui/material/colors";

interface MonitorBrightnessSliderProps {
	monitorId: string;
	mode: UIMonitor["mode"];
	brightness: number;
	disabled: boolean;
	color?: SlideProps["color"];
}

const darkTeal = Color(teal[900]).darken(0.1).hexa();

const MonitorBrightnessSlider: React.FC<MonitorBrightnessSliderProps> = ({
	monitorId,
	brightness,
	color,
	disabled: monitorDisabled
}) => {
	const license = useAppSelector((state) => state.app.license);
	const dispatch = useAppDispatch();
	const disabled = useMemo(
		() => monitorDisabled || (license === "free" && monitorId === GLOBAL),
		[monitorId, monitorDisabled, license]
	);

	const baseTheme = useTheme();
	const theme = useMemo(
		() =>
			createTheme({
				...baseTheme,
				components: monitorDisabled
					? baseTheme.components
					: merge({}, baseTheme.components, {
							MuiTooltip: {
								defaultProps: {
									arrow: true
								},
								styleOverrides: {
									tooltip: {
										backgroundColor: darkTeal
									},
									arrow: {
										"&:before": {
											backgroundColor: darkTeal
										}
									}
								}
							}
					  } as Theme["components"])
			}),
		[baseTheme, monitorDisabled]
	);

	const dispatchBrightness = (newBrightness: number) => {
		if (monitorId === GLOBAL) {
			dispatch(setBrightness(newBrightness));
		} else {
			dispatch(
				setMonitorBrightness({
					id: monitorId,
					brightness: newBrightness
				})
			);
		}
	};

	const handleBrightnessUpdate = (brightness: number) => dispatchBrightness(brightness);

	return (
		<ThemeProvider theme={theme}>
			<Slider
				color={color}
				value={brightness}
				percentage={true}
				disabled={disabled}
				onChange={handleBrightnessUpdate}
			/>
		</ThemeProvider>
	);
};

export default MonitorBrightnessSlider;

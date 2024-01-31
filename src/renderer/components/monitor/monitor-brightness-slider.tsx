import React, { useMemo } from "react";
import { setBrightness, setMonitorBrightness } from "@reducers/app";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { GLOBAL, UIMonitor } from "@common/types";
import { SlideProps } from "@mui/material";

interface MonitorBrightnessSliderProps {
	monitorId: string;
	mode: UIMonitor["mode"];
	brightness: number;
	disabled: boolean;
	color?: SlideProps["color"];
}

const MonitorBrightnessSlider: React.FC<MonitorBrightnessSliderProps> = ({
	                                                                         monitorId,
	                                                                         brightness,
	                                                                         color,
	                                                                         disabled: monitorDisabled,
                                                                         }) => {
	const license = useAppSelector((state) => state.app.license);
	const dispatch = useAppDispatch();
	const disabled = useMemo(
		() => monitorDisabled || (license === "free" && monitorId === GLOBAL),
		[monitorId, monitorDisabled, license],
	);

	const dispatchBrightness = (newBrightness: number) => {
		if (monitorId === GLOBAL) {
			dispatch(setBrightness(newBrightness));
		} else {
			dispatch(
				setMonitorBrightness({
					id: monitorId,
					brightness: newBrightness,
				})
			);
		}
	};

	const handleBrightnessUpdate = (brightness: number) => dispatchBrightness(brightness);

	return (
	< Sl, ider;
	color = { color };
	value = { brightness };
	percentage = { true };
	disabled = { disabled };
	onChange = { handleBrightnessUpdate };
	/>;;;
)
	;
};

export default MonitorBrightnessSlider;

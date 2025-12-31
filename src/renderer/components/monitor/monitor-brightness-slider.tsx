import React, { useCallback } from "react";
import { setBrightness, setMonitorBrightness } from "@reducers/app";
import { useAppDispatch } from "@renderer/hooks";
import { GLOBAL, UIMonitor } from "@common/types";
import { SlideProps } from "@mui/material";
import Slider, { SliderProps } from "@components/slider";

type MonitorBrightnessSliderProps = {
	monitorId: string;
	color?: SlideProps["color"];
} & Pick<UIMonitor, "brightness" | "mode" | "disabled" | "position" | "size">;

const MonitorBrightnessSlider: React.FC<MonitorBrightnessSliderProps> = ({
	monitorId,
	brightness,
	color,
	disabled: monitorDisabled,
	mode,
	position,
	size
}) => {
	const dispatch = useAppDispatch();

	const dispatchBrightness = useCallback(
		(newBrightness: number) => {
			if (monitorId === GLOBAL) {
				dispatch(setBrightness(newBrightness));
			} else {
				dispatch(
					setMonitorBrightness({
						id: monitorId,
						brightness: newBrightness,
						mode,
						disabled: monitorDisabled,
						position,
						size
					})
				);
			}
		},
		[monitorId, dispatch, mode, monitorDisabled, position, size]
	);

	const handleBrightnessUpdate: SliderProps["onChange"] = (brightness) => dispatchBrightness(brightness as number);

	return (
		<Slider
			color={color}
			value={brightness}
			percentage={true}
			disabled={monitorDisabled}
			onChange={handleBrightnessUpdate}
		/>
	);
};

export default MonitorBrightnessSlider;

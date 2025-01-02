import React, { useCallback, useMemo } from "react";
import { setBrightness, setMonitorBrightness } from "@reducers/app";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { GLOBAL, UIMonitor } from "@common/types";
import { SlideProps } from "@mui/material";
import Slider from "@components/slider";

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
	const license = useAppSelector((state) => state.app.license);
	const dispatch = useAppDispatch();
	const disabled = useMemo(
		() => monitorDisabled || (license === "free" && monitorId === GLOBAL),
		[monitorId, monitorDisabled, license]
	);

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

	const handleBrightnessUpdate = (brightness: number) => dispatchBrightness(brightness);

	return (
		<Slider
			color={color}
			value={brightness}
			percentage={true}
			disabled={disabled}
			onChange={handleBrightnessUpdate}
		/>
	);
};

export default MonitorBrightnessSlider;

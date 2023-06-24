import React, { useMemo } from "react";
import { GLOBAL } from "lumi-control";
import { setBrightness, setMonitorBrightness } from "../../reducers/app";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { UIMonitor } from "../../../common/types";
import Slider from "../slider";

interface MonitorBrightnessSliderProps {
	monitorId: string;
	mode: UIMonitor["mode"];
	brightness: number;
	disabled: boolean;
}

const MonitorBrightnessSlider: React.FC<MonitorBrightnessSliderProps> = ({ monitorId, mode, brightness, disabled: monitorDisabled }) => {
	const license = useAppSelector((state) => state.app.license);
	const dispatch = useAppDispatch();
	const disabled = useMemo(() => monitorDisabled || (license === "free" && monitorId === GLOBAL), [monitorId, monitorDisabled, license]);

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

	return <Slider value={brightness} disabled={disabled} onChange={handleBrightnessUpdate} />;
};

export default MonitorBrightnessSlider;

import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import Dialog, { DialogComponentProps } from "../dialog";
import { LocalizationProvider, TimeClock, TimeView } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { Button, Collapse, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import Stepper from "../stepper/stepper";
import StepView from "../stepper/step-view";
import MonitorMultiSelectList from "../monitor/monitor-multi-select-list";
import Slider, { SliderProps } from "../slider";
import Color from "color";
import {
	CalendarAddOn,
	HourglassBottom,
	HourglassTop,
	MonitorOutlined,
	Person,
	Timer,
	WbSunny,
	WbTwilight
} from "mui-symbols";
import { ScheduleItem, UIMonitor } from "@common/types";
import { redux } from "@redux";
import { useAppDispatch } from "@hooks";
import { addSchedule, editSchedule, setMonitorBrightness } from "@reducers/app";
import { clone } from "lodash";
import { dayjs, Dayjs, getDateFromTime } from "@common/dayjs";
import { ipcRenderer } from "electron";
import * as SunCalc from "suncalc";

interface ScheduleItemDialogProps extends DialogComponentProps {
	edit: null | ScheduleItem;
}

function getColorAtProgress(
	startColor: [number, number, number, number],
	endColor: [number, number, number, number],
	progress: number
): [number, number, number, number] {
	if (progress < 0 || progress > 1) {
		throw new Error("Progress must be a value between 0 and 1");
	}

	let resultColor: [number, number, number, number] = [0, 0, 0, 0];

	for (let i = 0; i < 4; i++) {
		resultColor[i] = startColor[i] + (endColor[i] - startColor[i]) * progress;
	}

	return resultColor;
}

const AddScheduleDialog: React.FC<ScheduleItemDialogProps> = ({ open, edit, onClose }) => {
	const [activeStep, setActiveStep] = useState<number>(0);

	const [selectedMonitors, setSelectedMonitors] = useState<Array<UIMonitor>>(edit?.monitors ?? []);
	const [brightness, setBrightness] = useState<number>(edit?.brightness ?? 100);
	const [time, setTime] = useState<Dayjs | null>(edit?.time ? getDateFromTime(edit.time) : dayjs());
	const [timeView, setTimeView] = useState<TimeView>("hours");
	const [type, setType] = useState<"manual" | "sunrise" | "sunset">(edit?.type ?? "manual");

	const [userPosition, setUserPosition] = useState<GeolocationCoordinates | null>(null);

	const [sunrise, setSunrise] = useState<Dayjs | null>(null);
	const [sunset, setSunset] = useState<Dayjs | null>(null);

	const dispatch = useAppDispatch();
	const container = createRef<HTMLDivElement>();
	const brightnessColor = useMemo(
		() => Color(getColorAtProgress([68, 34, 120, 1], [255, 255, 255, 1], brightness / 100)).hexa(),
		[brightness]
	);
	const brightnessTextColor = useMemo(() => (Color(brightnessColor).isLight() ? "#000" : "#FFF"), [brightnessColor]);

	const monitorSnapshot = useRef<Array<UIMonitor>>();

	const toggleTimeView = () => {
		setTimeView((prevTimeView) => (prevTimeView === "hours" ? "minutes" : "hours"));
	};

	const handleTimeChange = (newTime: Dayjs) => {
		setTime(newTime);
	};

	const handleViewChange = (newView: TimeView) => {
		setTimeView(newView);
	};

	const handleStepChange = (step: number) => setActiveStep(step);

	const handleMonitorSelectChange = (monitors: Array<UIMonitor>) => setSelectedMonitors(monitors);

	const handleBrightnessChange: SliderProps["onChange"] = (brightness) => setBrightness(brightness as number);

	const handleReset = () => {
		setActiveStep(0);
		setSelectedMonitors([]);
		setBrightness(100);
		setTime(dayjs());
		setTimeView("hours");
		setType("manual");
	};

	const handleTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: "manual" | "sunrise" | "sunset") => {
		setType(newType);
	};

	const steps = [
		{
			title: "Displays",
			icon: MonitorOutlined,
			component: (
				<StepView variant={"elevation"}>
					<MonitorMultiSelectList value={selectedMonitors} onChange={handleMonitorSelectChange} />
				</StepView>
			)
		},
		{
			title: `${
				type === "manual"
					? `${time.format("hh:mm")} ${time.format("A")}`
					: type === "sunrise"
					? sunrise?.format("hh:mm A")
					: sunset?.format("hh:mm A")
			}`,
			icon: Timer,
			component: (
				<StepView>
					<Stack alignItems={"center"}>
						<ToggleButtonGroup
							size={"small"}
							value={type}
							exclusive={true}
							onChange={handleTypeChange}
							color={"primary"}
						>
							<ToggleButton value={"sunrise"}>
								<Stack direction={"row"} gap={1}>
									<WbSunny />
									Sunrise
								</Stack>
							</ToggleButton>
							<ToggleButton value={"sunset"}>
								<Stack direction={"row"} gap={1}>
									<WbTwilight />
									Sunset
								</Stack>
							</ToggleButton>
							<ToggleButton value={"manual"}>
								<Stack direction={"row"} gap={1}>
									<Person />
									Manual
								</Stack>
							</ToggleButton>
						</ToggleButtonGroup>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<TimeClock
								disabled={type !== "manual"}
								views={["hours", "minutes"]}
								value={time}
								view={timeView}
								ampm={false}
								onChange={handleTimeChange}
								onViewChange={handleViewChange}
							/>
						</LocalizationProvider>
						<Button
							disabled={type !== "manual"}
							startIcon={timeView === "hours" ? <HourglassTop /> : <HourglassBottom />}
							onClick={toggleTimeView}
							sx={{ textTransform: "capitalize" }}
						>
							View {timeView === "hours" ? "minutes" : "hours"}
						</Button>
					</Stack>
				</StepView>
			)
		},
		{
			title: "Brightness",
			icon: WbSunny,
			component: (
				<StepView
					elevation={0}
					sx={{ flex: 1, bgcolor: brightnessColor, color: brightnessTextColor, height: "100%" }}
				>
					<Stack alignItems={"center"} justifyContent={"center"}>
						<Stack
							direction={"row"}
							width={"100%"}
							justifyContent={"center"}
							ref={container}
							overflow={"hidden"}
						>
							{brightness
								.toString()
								.split("")
								.map((char, index) => {
									return (
										<Collapse
											key={`brightness-value-${index}-${char}`}
											in={true}
											mountOnEnter={true}
											unmountOnExit={true}
											sx={{
												display: "inline-block"
											}}
										>
											<Typography variant={"h3"} fontWeight={800} display={"inline-block"}>
												{char}
											</Typography>
										</Collapse>
									);
								})}
							<Typography variant={"h3"} sx={{ opacity: 0.7 }}>
								%
							</Typography>
						</Stack>
						<Slider
							color={"inherit"}
							value={brightness}
							disableTooltip={true}
							onChange={handleBrightnessChange}
						/>
					</Stack>
				</StepView>
			)
		}
	];

	const canAdd = useMemo(() => selectedMonitors.length !== 0, [selectedMonitors.length]);

	const getUserPosition = (): Promise<GeolocationCoordinates> => {
		return new Promise((resolve) => {
			navigator.geolocation.getCurrentPosition((position) => {
				resolve(position.coords);
			});
		});
	};

	const updateUserPosition = async () => {
		const position = await getUserPosition();
		setUserPosition(position);
	};

	useEffect(() => {
		if (!userPosition) return;
		const time = SunCalc.getTimes(dayjs().toDate(), userPosition.latitude, userPosition.longitude);
		setSunrise(dayjs(time.sunrise));
		setSunset(dayjs(time.sunset));
	}, [userPosition]);

	useEffect(() => {
		if (!open) return;
		selectedMonitors.forEach(({ id, brightness, mode, disabled, position, size }) => {
			dispatch(
				setMonitorBrightness({
					id,
					brightness,
					mode,
					disabled,
					position,
					size
				})
			);
		});
	}, [brightness]);

	useEffect(() => {
		if (open) {
			updateUserPosition();
			ipcRenderer.send("app/window/offset/height", 124);
			monitorSnapshot.current = clone(redux.getState().app.monitors);
			if (edit) {
				setSelectedMonitors(clone(edit.monitors));
				setBrightness(edit.brightness);
				setTime(getDateFromTime(edit.time));
			} else {
				setTime(dayjs());
			}
		} else {
			ipcRenderer.send("app/window/offset/height", 0);
			monitorSnapshot.current?.forEach(({ id, brightness, mode, disabled, position, size }) => {
				dispatch(setMonitorBrightness({ id, brightness, mode, disabled, position, size }));
			});
		}
	}, [open]);

	return (
		<Dialog
			title={edit ? "Edit schedule" : "Add schedule"}
			icon={<CalendarAddOn />}
			open={open}
			actions={[
				{
					label: edit ? "Apply" : "Add",
					disabled: !canAdd,
					onClick: () => {
						const content = {
							monitors: selectedMonitors,
							time: time.format("hh:mm A"),
							brightness,
							type
						};

						if (edit) {
							dispatch(
								editSchedule({
									...edit,
									...content
								})
							);
						} else {
							dispatch(addSchedule(content));
						}

						onClose();
					}
				}
			]}
			scrollContent={"y"}
			onClose={onClose}
			onExited={handleReset}
		>
			<Stack p={2}>
				<Stepper steps={steps} activeStep={activeStep} onChange={handleStepChange} />
			</Stack>
		</Dialog>
	);
};

export default AddScheduleDialog;

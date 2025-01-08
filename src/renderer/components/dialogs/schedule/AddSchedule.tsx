import React, { useEffect, useMemo, useRef, useState } from "react";
import Dialog, { DialogComponentProps } from "@components/dialog";

import { Box, Step, StepLabel, Stepper } from "@mui/material";
import { CalendarAddOn } from "mui-symbols";
import { ScheduleItem, UIMonitor } from "@common/types";
import { redux } from "@redux";
import { useAppDispatch } from "@hooks";
import { addSchedule, editSchedule, setMonitorBrightness } from "@reducers/app";
import { clone } from "lodash";
import { dayjs, Dayjs, getDateFromTime } from "@common/dayjs";
import { ipcRenderer } from "electron";
import { ScheduleContext } from "./context";
import MonitorMultiSelectList from "../../monitor/monitor-multi-select-list";
import TimeSelectScreen from "./TimeSelectScreen";
import BrightnessSelectScreen from "./BrightnessSelectScreen";

interface ScheduleItemDialogProps extends DialogComponentProps {
	edit: null | ScheduleItem;
}

const AddScheduleDialog: React.FC<ScheduleItemDialogProps> = ({ open, edit, onClose }) => {
	const [activeStep, setActiveStep] = useState<number>(0);

	const [selectedMonitors, setSelectedMonitors] = useState<Array<UIMonitor>>(edit?.monitors ?? []);
	const [brightness, setBrightness] = useState<number>(edit?.brightness ?? 100);
	const [time, setTime] = useState<Dayjs | null>(edit?.time ? getDateFromTime(edit.time) : dayjs());
	const [type, setType] = useState<ScheduleItem["type"]>(edit?.type ?? "manual");

	const dispatch = useAppDispatch();

	const monitorSnapshot = useRef<Array<UIMonitor>>();

	const handleMonitorSelectChange = (monitors: Array<UIMonitor>) => setSelectedMonitors(monitors);

	const handleReset = () => {
		setActiveStep(0);
		setSelectedMonitors([]);
		setBrightness(100);
		setTime(dayjs());
		setType("manual");
	};

	const canAdd = useMemo(() => selectedMonitors.length !== 0, [selectedMonitors.length]);

	const nextButton = useMemo(() => {
		return {
			label: "Next",
			disabled: activeStep === 2,
			onClick: () => {
				setActiveStep((step) => step + 1);
			}
		};
	}, [activeStep]);

	const confirmButton = useMemo(() => {
		return {
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
		};
	}, [edit, canAdd, selectedMonitors, time, brightness, type, dispatch, onClose]);

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
		<ScheduleContext.Provider
			value={{
				type,
				brightness,
				monitors: selectedMonitors,
				time,
				setTime,
				setType,
				setBrightness
			}}
		>
			<Dialog
				title={edit ? "Edit schedule" : "Add schedule"}
				icon={<CalendarAddOn />}
				open={open}
				actions={[
					{
						label: "Back",
						disabled: activeStep === 0,
						onClick: () => {
							setActiveStep((step) => step - 1);
						}
					},
					activeStep === 2 ? confirmButton : nextButton
				]}
				scrollContent={"y"}
				onClose={onClose}
				onExited={handleReset}
			>
				<Box sx={{ flex: 1 }}>
					<Stepper activeStep={activeStep} orientation={"horizontal"} sx={{ p: 2 }}>
						<Step>
							<StepLabel>Displays</StepLabel>
						</Step>
						<Step>
							<StepLabel>Time</StepLabel>
						</Step>
						<Step>
							<StepLabel>Brightness</StepLabel>
						</Step>
					</Stepper>
					<Box py={2}>
						{activeStep === 0 && (
							<MonitorMultiSelectList value={selectedMonitors} onChange={handleMonitorSelectChange} />
						)}
						{activeStep === 1 && <TimeSelectScreen />}
						{activeStep === 2 && <BrightnessSelectScreen />}
					</Box>
				</Box>
			</Dialog>
		</ScheduleContext.Provider>
	);
};

export default AddScheduleDialog;

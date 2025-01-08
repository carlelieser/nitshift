import { Box, Button, SelectChangeEvent, Stack, Typography } from "@mui/material";
import { LocalizationProvider, TimeClock, TimeView } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { HourglassBottom, HourglassTop } from "mui-symbols";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ScheduleContext } from "./context";
import ScheduleTypeSelect from "./ScheduleTypeSelect";
import * as SunCalc from "suncalc";
import { GetTimesResult } from "suncalc";
import dayjs, { Dayjs } from "dayjs";
import { scheduleTypes } from "@common/utils";
import { ScheduleItem } from "@common/types";

const TimeSelectScreen = () => {
	const context = useContext(ScheduleContext);
	const [times, setTimes] = useState<GetTimesResult | null>(null);
	const [timeView, setTimeView] = useState<TimeView>("hours");
	const [userPosition, setUserPosition] = useState<GeolocationCoordinates | null>(null);

	const sunTime = useMemo(() => dayjs(times?.[context.type as keyof GetTimesResult]), [times, context.type]);

	const currentTime = useMemo(
		() => (context.type === "manual" ? context.time : sunTime),
		[context.time, sunTime, context.type]
	);

	const getUserPosition = (): Promise<GeolocationCoordinates> => {
		return new Promise((resolve) => {
			navigator.geolocation.getCurrentPosition((position) => {
				resolve(position.coords);
			});
		});
	};

	const toggleTimeView = () => {
		setTimeView((prevTimeView) => (prevTimeView === "hours" ? "minutes" : "hours"));
	};

	const handleTimeChange = (newTime: Dayjs) => {
		context.setTime(newTime);
	};

	const handleViewChange = (newView: TimeView) => {
		setTimeView(newView);
	};

	const handleTypeChange = (e: SelectChangeEvent<ScheduleItem["type"]>) => {
		context.setType(e.target.value as ScheduleItem["type"]);
	};

	const updateUserPosition = async () => {
		const position = await getUserPosition();
		setUserPosition(position);
	};

	useEffect(() => {
		if (!userPosition) return;
		const times = SunCalc.getTimes(dayjs().toDate(), userPosition.latitude, userPosition.longitude);
		setTimes(times);
	}, [userPosition]);

	useEffect(() => {
		updateUserPosition();
	}, []);

	return (
		<Stack alignItems={"center"}>
			<ScheduleTypeSelect
				value={context.type}
				onChange={handleTypeChange}
				renderValue={(value) => (
					<Stack direction={"row"} gap={2} alignItems={"center"}>
						<Typography>{scheduleTypes[value]}</Typography>
						<Box
							sx={{
								display: "inline",
								color: "primary.main"
							}}
						>
							{currentTime?.format("hh:mm A")}
						</Box>
					</Stack>
				)}
			/>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<TimeClock
					disabled={context.type !== "manual"}
					views={["hours", "minutes"]}
					value={currentTime}
					view={timeView}
					ampm={false}
					onChange={handleTimeChange}
					onViewChange={handleViewChange}
				/>
			</LocalizationProvider>
			<Button
				disabled={context.type !== "manual"}
				startIcon={timeView === "hours" ? <HourglassTop /> : <HourglassBottom />}
				onClick={toggleTimeView}
				sx={{ textTransform: "capitalize" }}
			>
				View {timeView === "hours" ? "minutes" : "hours"}
			</Button>
		</Stack>
	);
};

export default TimeSelectScreen;

import { ScheduleItem } from "@common/types";
import { MenuItem, Select, SelectProps } from "@mui/material";
import React from "react";
import { scheduleTypes } from "@common/utils";

const ScheduleTypeSelect = (props: SelectProps<ScheduleItem["type"]>) => {
	return (
		<Select {...props}>
			{Object.entries(scheduleTypes).map(([key, value]) => (
				<MenuItem key={`schedule-type-${key}`} value={key}>
					{value}
				</MenuItem>
			))}
		</Select>
	);
};

export default ScheduleTypeSelect;

import React, { useMemo, useState } from "react";
import { Button, Chip, Divider, Paper, Stack } from "@mui/material";
import { removeSchedule, ScheduleItem } from "../reducers/app";
import { Delete, Edit, Monitor, Timer, WbSunny } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../hooks";
import { randomUUID } from "crypto";
import ScheduleItemDialog from "./dialogs/schedule-item";
import { getDateFromTime } from "../dayjs";

const Schedule: React.FC<ScheduleItem> = (props) => {
	const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

	const id = useMemo(() => randomUUID(), []);
	const dispatch = useAppDispatch();
	const monitors = useAppSelector((state) => state.app.monitors);
	const monitorNames = useMemo(
		() => monitors.filter((monitor) => props.monitors.includes(monitor.id)).map((monitor) => monitor.name),
		[monitors, props.monitors]
	);

	const openEditDialog = () => setEditDialogOpen(true);
	const closeEditDialog = () => setEditDialogOpen(false);

	const handleRemoveSchedule = () => dispatch(removeSchedule(props.id));

	return (
		<Paper elevation={4}>
			<ScheduleItemDialog edit={props} open={editDialogOpen} onClose={closeEditDialog} />
			<Stack spacing={2} justifyContent={"space-between"} py={2}>
				<Stack direction={"row"} alignItems={"center"} spacing={2} px={2}>
					<Monitor />
					<Stack direction={"row"} alignItems={"center"} gap={1} flexWrap={"wrap"}>
						{monitorNames.map((name) => (
							<Chip key={`${id}-${name}`} label={name} />
						))}
					</Stack>
				</Stack>
				<Divider />
				<Stack direction={"row"} justifyContent={"space-between"} px={2}>
					<Stack direction={"row"} alignItems={"center"} spacing={2}>
						<Timer />
						<Chip label={getDateFromTime(props.time).format("hh:mm A")} />
					</Stack>
					<Divider orientation={"vertical"} flexItem={true} />
					<Stack direction={"row"} alignItems={"center"} spacing={2}>
						<WbSunny />
						<Chip label={props.brightness + "%"} />
					</Stack>
				</Stack>
				<Divider />
				<Stack direction={"row"} alignItems={"center"} justifyContent={"end"} spacing={1} px={2}>
					<Button startIcon={<Delete />} color={"secondary"} onClick={handleRemoveSchedule}>
						Remove
					</Button>
					<Button startIcon={<Edit />} onClick={openEditDialog}>
						Edit
					</Button>
				</Stack>
			</Stack>
		</Paper>
	);
};

export default Schedule;

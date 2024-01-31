import React, { useMemo, useState } from "react";
import { Box, Button, Chip, Divider, lighten, Paper, Stack, Typography, useTheme } from "@mui/material";
import { removeSchedule } from "@reducers/app";
import { Delete, Edit, MonitorOutlined, Timer, WbSunny } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@hooks";
import { randomUUID } from "crypto";
import AddScheduleDialog from "./dialogs/add-schedule";
import { getDateFromTime } from "@common/dayjs";
import { ScheduleItem } from "@common/types";

const Schedule: React.FC<ScheduleItem> = (props) => {
	const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
	const theme = useTheme();

	const id = useMemo(() => randomUUID(), []);
	const dispatch = useAppDispatch();
	const monitors = useAppSelector((state) => state.app.monitors);

	const openEditDialog = () => setEditDialogOpen(true);
	const closeEditDialog = () => setEditDialogOpen(false);

	const handleRemoveSchedule = () => dispatch(removeSchedule(props.id));

	return (
		<Paper elevation={4} variant={"elevation"} sx={{ borderRadius: 4 }}>
			<AddScheduleDialog edit={props} open={editDialogOpen} onClose={closeEditDialog} />
			<Stack spacing={2} justifyContent={"space-between"} py={2}>
				<Stack direction={"row"} alignItems={"center"} spacing={2} px={2}>
					<MonitorOutlined />
					<Stack direction={"row"} alignItems={"center"} gap={1} flexWrap={"wrap"}>
						{props.monitors.map((monitor) => {
							const connected = monitors.find((ref) => ref.id === monitor.id)?.connected;
							return (
								<Paper
									key={`${id}-${monitor.name}`}
									sx={{
										px: 2,
										py: 1,
										borderRadius: 2,
										bgcolor: lighten(theme.palette.background.paper, 6 * 0.025),
									}}
									variant={"outlined"}
								>
									<Stack spacing={-0.5}>
										<Typography textTransform={"uppercase"}>{monitor.nickname}</Typography>
										<Stack direction={"row"} alignItems={"center"} spacing={1}>
											<Box
												width={6}
												height={6}
												borderRadius={"100%"}
												bgcolor={connected ? "success.main" : "error.main"}
											/>
											<Typography fontSize={12} sx={{ opacity: 0.7 }}>
												{connected ? "Connected" : "Disconnected"}
											</Typography>
										</Stack>
									</Stack>
								</Paper>
							);
						})}
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

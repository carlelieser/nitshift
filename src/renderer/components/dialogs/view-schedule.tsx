import React, { useState } from "react";
import { Box, Collapse, Fab, Grow, Stack, Typography } from "@mui/material";
import Dialog, { DialogComponentProps } from "../dialog";
import { useAppSelector } from "@hooks";
import { Add, Schedule as ScheduleIcon } from "mui-symbols";
import { TransitionGroup } from "react-transition-group";
import Schedule from "../schedule";
import AddScheduleDialog from "./add-schedule";

import clock from "@assets/img/clock.jpeg";

const ViewScheduleDialog: React.FC<DialogComponentProps> = ({ open, onClose }) => {
	const [addScheduleDialogOpen, setAddScheduleDialogOpen] = useState<boolean>(false);

	const schedule = useAppSelector((state) => state.app.schedule);

	const openDialog = () => setAddScheduleDialogOpen(true);
	const closeDialog = () => setAddScheduleDialogOpen(false);

	return (
		<Dialog open={open} icon={<ScheduleIcon />} onClose={onClose} title={"Schedule"}>
			<Stack spacing={2} p={2} pb={12}>
				<TransitionGroup>
					{schedule.length === 0 ? (
						<Grow mountOnEnter={true} unmountOnExit={true}>
							<Stack
								alignItems={"center"}
								justifyContent={"center"}
								textAlign={"center"}
								p={2}
								spacing={2}
							>
								<Box
									sx={{
										backgroundImage: `url("${clock}")`,
										backgroundSize: "cover",
										backgroundPosition: "center",
										borderRadius: "100%",
										width: 140,
										height: 140,
										minWidth: 140,
										minHeight: 140,
									}}
								/>
								<Stack spacing={1}>
									<Typography variant={"h4"}>No schedule set</Typography>
									<Typography sx={{ opacity: 0.7 }}>
										Add a schedule to adjust monitor brightness at specific times.
									</Typography>
								</Stack>
							</Stack>
						</Grow>
					) : null}
					{schedule.length ? (
						<Grow mountOnEnter={true} unmountOnExit={true}>
							<Box>
								<Stack spacing={2} component={TransitionGroup}>
									{schedule.map((schedule) => (
										<Collapse key={schedule.id}>
											<Box>
												<Schedule {...schedule} />
											</Box>
										</Collapse>
									))}
								</Stack>
							</Box>
						</Grow>
					) : null}
				</TransitionGroup>
				<Fab color={"primary"} sx={{ bottom: 24, right: 24, position: "absolute" }} onClick={openDialog}>
					<Add />
				</Fab>
			</Stack>
			<AddScheduleDialog edit={null} open={addScheduleDialogOpen} onClose={closeDialog} />
		</Dialog>
	);
};

export default ViewScheduleDialog;

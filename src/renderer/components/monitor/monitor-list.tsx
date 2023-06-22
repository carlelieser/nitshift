import React, { useMemo } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { GLOBAL } from "lumi-control";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { AutoAwesome } from "@mui/icons-material";
import { setMonitors, setTrialStartDate } from "../../reducers/app";
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from "react-beautiful-dnd";

import Monitor from "./monitor";
import { UIMonitor } from "../../../common/types";

const MonitorList = () => {
	const dispatch = useAppDispatch();
	const trialAvailability = useAppSelector((state) => state.app.trialAvailability);
	const monitors = useAppSelector((state) => state.app.monitors);
	const license = useAppSelector((state) => state.app.license);
	const brightness = useAppSelector((state) => state.app.brightness);

	const globalMonitorDisabled = useMemo(() => license === "free" || monitors.every(({ disabled }) => disabled), [license, monitors]);

	const reorder = (list: Array<UIMonitor>, startIndex: number, endIndex: number) => {
		const result = Array.from(list);
		if (license === "free" && endIndex > 1) return result;
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);
		return result;
	};

	const handleDragEnd: OnDragEndResponder = (result) => {
		if (!result.destination) return;
		dispatch(setMonitors(reorder(monitors, result.source.index, result.destination.index)));
	};

	const startFreeTrial = () => dispatch(setTrialStartDate(Date.now()));

	return (
		<Paper
			sx={{
				bgcolor: "inherit",
				borderRadius: 0,
				zIndex: 0,
				position: "relative",
			}}
			elevation={0}
		>
			<Stack spacing={2} p={2}>
				<Stack spacing={2}>
					<Monitor
						id={GLOBAL}
						name={GLOBAL}
						brightness={brightness}
						mode={"native"}
						disabled={globalMonitorDisabled}
						internal={false}
						manufacturer={null}
						productCode={null}
						serialNumber={null}
						position={{ x: 0, y: 0 }}
						size={{ width: 0, height: 0 }}
					/>
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId={"droppable"}>
							{(provided, droppableSnapshot) => (
								<Box {...provided.droppableProps} ref={provided.innerRef}>
									{monitors.map((monitor, index) => {
										const disabled = license === "free" ? (index > 1 ? true : monitor.disabled) : monitor.disabled;
										const dragDisabled = disabled || monitors.length === 1;
										return (
											<Draggable
												isDragDisabled={dragDisabled}
												key={monitor.id}
												draggableId={monitor.id}
												index={index}
											>
												{(provided, snapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														style={{
															...provided.draggableProps.style,
															pointerEvents: !droppableSnapshot.isDraggingOver
																? "auto"
																: droppableSnapshot.isDraggingOver && !snapshot.isDragging
																? "none"
																: "auto",
															marginBottom: 16,
														}}
													>
														<Monitor
															{...monitor}
															disabled={disabled}
															dragDisabled={dragDisabled}
															dragHandleProps={provided.dragHandleProps}
														/>
													</div>
												)}
											</Draggable>
										);
									})}
									{provided.placeholder}
								</Box>
							)}
						</Droppable>
					</DragDropContext>
				</Stack>
			</Stack>
			{license === "free" && trialAvailability ? (
				<Paper sx={{ position: "sticky", bottom: 0, borderRadius: 3, zIndex: 5 }} elevation={4}>
					<Button startIcon={<AutoAwesome color={"warning"} />} variant={"contained"} fullWidth={true} onClick={startFreeTrial}>
						<Stack direction={"row"} spacing={1} alignItems={"center"}>
							<Typography variant={"button"}>Start 7-day free trial</Typography>
							<Typography variant={"button"} fontSize={10} sx={{ opacity: 0.7 }}>
								No cc required
							</Typography>
						</Stack>
					</Button>
				</Paper>
			) : null}
		</Paper>
	);
};

export default MonitorList;

import React, { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import { Box, Collapse, Paper, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setMonitors } from "@reducers/app";
import { DragDropContext, Droppable, OnDragEndResponder } from "react-beautiful-dnd";

import { GLOBAL, UIMonitor } from "@common/types";
import DraggableMonitorWrapper from "@components/monitor/draggable-monitor-wrapper";
import { ipcRenderer } from "electron";
import { dimensions } from "@common/utils";
import { TransitionGroup } from "react-transition-group";

const Monitor = lazy(() => import("./monitor"));

const MonitorList = () => {
	const dispatch = useAppDispatch();
	const monitors = useAppSelector((state) => state.app.monitors);
	const connectedMonitors = useMemo(() => monitors.filter((monitor) => monitor.connected), [monitors]);
	const license = useAppSelector((state) => state.app.license);
	const brightness = useAppSelector((state) => state.app.brightness);
	const autoResize = useAppSelector((state) => state.app.autoResize);
	const ref = useRef(null);
	const mode = useAppSelector((state) => state.app.mode);
	const [height, setHeight] = React.useState(0);

	const globalMonitorDisabled = useMemo(
		() => license === "free" || connectedMonitors.every(({ disabled }) => disabled),
		[license, connectedMonitors]
	);

	const reorder = (list: Array<UIMonitor>, startIndex: number, endIndex: number) => {
		const result = Array.from(list);
		if (license === "free" && endIndex > 1) return result;
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);
		return result;
	};

	const handleDragEnd: OnDragEndResponder = (result) => {
		if (!result.destination) return;
		dispatch(setMonitors(reorder(connectedMonitors, result.source.index, result.destination.index)));
	};

	useEffect(() => {
		if (!ref.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			if (Number.isInteger(entries[0].contentRect.height)) setHeight(entries[0].contentRect.height);
		});

		resizeObserver.observe(ref.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	useEffect(() => {
		if (autoResize && mode === "expanded") {
			if (monitors.length) {
				ipcRenderer.send("app/window/offset/height", height - dimensions["expanded"].default.height + 100);
			}
		} else {
			ipcRenderer.send("app/window/offset/height", 0);
		}
	}, [autoResize, monitors, mode, height]);

	return (
		<Paper
			sx={{
				borderRadius: 0,
				zIndex: 0,
				position: "relative",
				flex: 1,
				height: "100%",
				overflowX: "hidden"
			}}
			variant={"elevation"}
			elevation={0}
		>
			<Stack spacing={2} p={2} pb={license === "free" ? 8 : 0} ref={ref}>
				<Stack spacing={2}>
					<Suspense>
						<Monitor
							brightness={brightness}
							connected={true}
							disabled={globalMonitorDisabled}
							id={GLOBAL}
							internal={false}
							manufacturer={null}
							menuDisabled={true}
							mode={"native"}
							name={GLOBAL}
							nickname={""}
							position={{ x: 0, y: 0 }}
							productCode={null}
							serialNumber={null}
							size={{ width: 0, height: 0 }}
						/>
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId={"droppable"}>
								{(provided, droppableSnapshot) => (
									<Box ref={provided.innerRef} {...provided.droppableProps}>
										<TransitionGroup>
											{connectedMonitors.map((monitor, index) => (
												<Collapse key={monitor.id + "-wrapper"}>
													<DraggableMonitorWrapper
														forceDisableDrag={connectedMonitors.length === 1}
														index={index}
														isDraggingOver={droppableSnapshot.isDraggingOver}
														monitor={monitor}
														provided={provided}
													/>
												</Collapse>
											))}
											{provided.placeholder}
										</TransitionGroup>
									</Box>
								)}
							</Droppable>
						</DragDropContext>
					</Suspense>
				</Stack>
			</Stack>
		</Paper>
	);
};

export default MonitorList;

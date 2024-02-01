import React, { createContext, useMemo } from "react";
import { Draggable, DroppableProvided } from "react-beautiful-dnd";
import { useAppSelector } from "@hooks";
import { UIMonitor } from "@common/types";
import DraggableMonitor from "@renderer/components/monitor/draggable-monitor";

interface DraggableMonitorProps {
	monitor: UIMonitor;
	index: number;
	isDraggingOver: boolean;
	provided: DroppableProvided;
	forceDisableDrag: boolean;
}

export const DraggableMonitorContext = createContext({
	monitor: null,
	index: 0,
	isDraggingOver: false,
	disabled: false,
	menuDisabled: false,
	dragDisabled: false
});

const DraggableMonitorWrapper: React.FC<DraggableMonitorProps> = ({
	monitor,
	index,
	isDraggingOver,
	forceDisableDrag
}) => {
	const license = useAppSelector((state) => state.app.license);

	const freeLicenseFilter = useMemo(() => (index > 1 ? true : monitor.disabled), [index, monitor.disabled]);
	const disabled = useMemo(
		() => (license === "free" ? freeLicenseFilter : monitor.disabled),
		[license, freeLicenseFilter, monitor.disabled]
	);
	const menuDisabled = useMemo(() => (license === "free" ? index > 1 : false), [license, index]);
	const dragDisabled = useMemo(() => disabled || forceDisableDrag, [disabled, forceDisableDrag]);

	return (
		<DraggableMonitorContext.Provider
			value={{
				disabled,
				dragDisabled,
				index,
				isDraggingOver,
				menuDisabled,
				monitor
			}}
		>
			<Draggable isDragDisabled={dragDisabled} draggableId={monitor.id} index={index}>
				{(provided, snapshot) => (
					<DraggableMonitor key={monitor.id + "-draggable-monitor"} provided={provided} snapshot={snapshot} />
				)}
			</Draggable>
		</DraggableMonitorContext.Provider>
	);
};

export default DraggableMonitorWrapper;

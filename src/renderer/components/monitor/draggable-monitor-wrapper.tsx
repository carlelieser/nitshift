import React, { createContext, useMemo } from "react";
import { Draggable, DroppableProvided } from "react-beautiful-dnd";
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
	const disabled = useMemo(() => monitor.disabled, [monitor.disabled]);
	const menuDisabled = false;
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

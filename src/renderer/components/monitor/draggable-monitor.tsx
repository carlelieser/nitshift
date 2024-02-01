import React, { useContext, useMemo } from "react";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import Monitor from "@renderer/components/monitor/monitor";
import { DraggableMonitorContext } from "@renderer/components/monitor/draggable-monitor-wrapper";

interface DraggableMonitorProps {
	provided: DraggableProvided;
	snapshot: DraggableStateSnapshot;
}

const DraggableMonitor: React.FC<DraggableMonitorProps> = ({ provided, snapshot }) => {
	const { monitor, menuDisabled, disabled, dragDisabled, isDraggingOver } = useContext(DraggableMonitorContext);

	const pointerEvents = useMemo(() => {
		if (!isDraggingOver || snapshot.isDragging) return "auto";
		if (isDraggingOver && !snapshot.isDragging) return "none";
	}, [isDraggingOver, snapshot.isDragging]);

	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			style={{
				...provided.draggableProps.style,
				pointerEvents: pointerEvents,
				marginBottom: 16
			}}
		>
			<Monitor
				{...monitor}
				disabled={disabled}
				menuDisabled={menuDisabled}
				dragDisabled={dragDisabled}
				dragHandleProps={provided.dragHandleProps}
			/>
		</div>
	);
};

export default DraggableMonitor;

import React, { useState } from "react";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { Edit } from "mui-symbols";
import RenameMonitorDialog from "../dialogs/rename-monitor";

interface MonitorRenameProps {
	monitorId: string;
	currentName: string;
}

const MonitorRename: React.FC<MonitorRenameProps> = ({ monitorId, currentName }) => {
	const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);

	const openRenameModal = () => setRenameModalOpen(true);
	const closeRenameModal = () => setRenameModalOpen(false);

	return (
		<>
			<RenameMonitorDialog
				open={renameModalOpen}
				onClose={closeRenameModal}
				monitorId={monitorId}
				currentName={currentName}
			/>
			<MenuItem onClick={openRenameModal}>
				<ListItemIcon>
					<Edit />
				</ListItemIcon>
				<ListItemText>Rename</ListItemText>
			</MenuItem>
		</>
	);
};

export default MonitorRename;

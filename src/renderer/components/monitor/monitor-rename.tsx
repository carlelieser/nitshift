import React, { useEffect, useState } from "react";
import { ListItemIcon, ListItemText, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Edit } from "@mui/icons-material";
import Dialog from "../dialog";
import { ipcRenderer } from "electron";
import { useAppDispatch } from "../../hooks";
import { setMonitorName } from "../../reducers/app";
import { redux } from "../../redux";
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
			<RenameMonitorDialog open={renameModalOpen} onClose={closeRenameModal} monitorId={monitorId} currentName={currentName} />
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

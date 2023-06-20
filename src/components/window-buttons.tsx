import React, { useState } from "react";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Close, Key, UnfoldLess, UnfoldMore } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setMode, setTransitioning } from "../reducers/app";
import { ipcRenderer } from "electron";
import ActivationDialog from "./dialogs/activation";

const WindowButtons = () => {
	const dispatch = useAppDispatch();
	const license = useAppSelector((state) => state.app.license);
	const mode = useAppSelector((state) => state.app.mode);

	const [activationDialogOpen, setActivationDialogOpen] = useState<boolean>(false);

	const openActivationDialog = () => setActivationDialogOpen(true);
	const closeActivationDialog = () => setActivationDialogOpen(false);

	const handleMinimize = () => ipcRenderer.invoke("minimize");

	const toggleMode = () => {
		dispatch(setTransitioning(true));
		setTimeout(() => dispatch(setMode(mode === "compact" ? "expanded" : "compact")), 400);
	};

	return (
		<Stack direction={"row"} alignItems={"center"} spacing={1}>
			<ActivationDialog open={activationDialogOpen} onClose={closeActivationDialog} />
			{license !== "premium" ? (
				<Tooltip title={<Typography>Activate</Typography>}>
					<IconButton size={"small"} onClick={openActivationDialog}>
						<Key />
					</IconButton>
				</Tooltip>
			) : null}
			<Tooltip title={<Typography>{mode === "compact" ? "Expand" : "Minimize"}</Typography>}>
				<IconButton size={"small"} onClick={toggleMode}>
					{mode === "expanded" ? <UnfoldLess /> : <UnfoldMore />}
				</IconButton>
			</Tooltip>
			<Tooltip title={<Typography>Close</Typography>}>
				<IconButton size={"small"} onClick={handleMinimize}>
					<Close />
				</IconButton>
			</Tooltip>
		</Stack>
	);
};

export default WindowButtons;

import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { SettingsRoundedFilled } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setMode, setPrevMode, setSettingsDialogOpen, setTransitioning } from "@reducers/app";
import { batch } from "react-redux";
import ViewSettings from "../dialogs/settings";

const SettingsButton = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => state.app.mode);
	const prevMode = useAppSelector((state) => state.app.prevMode);
	const open = useAppSelector((state) => state.app.settingsDialogOpen);

	const openSettings = () => {
		if (mode === "expanded") {
			batch(() => {
				dispatch(setPrevMode(mode));
				dispatch(setSettingsDialogOpen(true));
			});
		} else {
			batch(() => {
				dispatch(setPrevMode(mode));
				dispatch(setTransitioning(true));
			});
			setTimeout(() => {
				batch(() => {
					dispatch(setSettingsDialogOpen(true));
					dispatch(setMode("expanded"));
					dispatch(setTransitioning(false));
				});
			}, 250);
		}
	}

	const closeSettings = () => {
		if (prevMode === "compact") {
			dispatch(setTransitioning(true));
			dispatch(setSettingsDialogOpen(false));
			setTimeout(() => {
				batch(() => {
					dispatch(setMode(prevMode));
					dispatch(setTransitioning(false));
				});
			}, 250);
		} else {
			dispatch(setSettingsDialogOpen(false));
		}
	};

	return (
		<Box>
			<ViewSettings open={open} onClose={closeSettings} />
			<Tooltip title={<Typography>Settings</Typography>}>
				<IconButton size={"small"} onClick={openSettings}>
					<SettingsRoundedFilled />
				</IconButton>
			</Tooltip>
		</Box>
	);
};

export default SettingsButton;

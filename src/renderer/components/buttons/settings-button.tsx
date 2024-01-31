import React, { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { SettingsRoundedFilled } from "mui-symbols";
import ViewSettings from "../dialogs/settings";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setMode } from "@reducers/app";

const SettingsButton = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => state.app.mode);
	const [open, setOpen] = useState<boolean>(false);

	const openSettings = () => {
		setOpen(true);
	};

	const closeSettings = () => {
		setOpen(false);
	};

	useEffect(() => {
		if (open && mode === "compact") dispatch(setMode("expanded"));
	}, [open, mode]);

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

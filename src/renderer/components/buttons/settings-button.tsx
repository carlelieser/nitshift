import React, { lazy, Suspense, useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { SettingsRoundedFilled } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setMode } from "@reducers/app";

const ViewSettings = lazy(() => import("../dialogs/settings"));

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
			<Suspense>
				<ViewSettings open={open} onClose={closeSettings} />
			</Suspense>
			<Tooltip title={<Typography>Settings</Typography>}>
				<IconButton size={"small"} onClick={openSettings}>
					<SettingsRoundedFilled />
				</IconButton>
			</Tooltip>
		</Box>
	);
};

export default SettingsButton;

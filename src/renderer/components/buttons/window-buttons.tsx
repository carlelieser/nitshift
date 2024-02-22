import React, { lazy, Suspense } from "react";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Close, UnfoldLess, UnfoldMore } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setMode, setTransitioning } from "@reducers/app";
import { ipcRenderer } from "electron";

const BrightnessModeButton = lazy(() => import("../brightness-mode/brightness-mode-button"));
const SettingsButton = lazy(() => import("./settings-button"));
const Upgrade = lazy(() => import("@promotional/buttons/upgrade-button"))

const WindowButtons = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => state.app.mode);

	const handleMinimize = async () => {
		await ipcRenderer.invoke("app/auto-hide/enable");
		await ipcRenderer.invoke("app/window/blur");
	};

	const toggleMode = () => {
		dispatch(setTransitioning(true));
		setTimeout(() => dispatch(setMode(mode === "compact" ? "expanded" : "compact")), 250);
	};

	return (
		<Stack direction={"row"} alignItems={"center"} spacing={1}>
			<Suspense>
				<Upgrade context={"window-bar"} size={"small"} />
				<BrightnessModeButton />
				<SettingsButton />
				<Tooltip title={<Typography>{mode === "compact" ? "Expanded View" : "Compact View"}</Typography>}>
					<IconButton size={"small"} onClick={toggleMode}>
						{mode === "expanded" ? <UnfoldLess /> : <UnfoldMore />}
					</IconButton>
				</Tooltip>
				<Tooltip title={<Typography>Close</Typography>}>
					<IconButton size={"small"} onClick={handleMinimize}>
						<Close />
					</IconButton>
				</Tooltip>
			</Suspense>
		</Stack>
	);
};

export default WindowButtons;

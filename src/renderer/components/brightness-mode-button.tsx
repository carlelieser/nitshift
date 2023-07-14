import React, { useRef, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useAppSelector } from "../hooks";
import Icon from "./icon";
import BrightnessModeMenu from "./brightness-mode-menu";

const BrightnessModeButton = () => {
	const activeMode = useAppSelector((state) => state.app.brightnessModes?.find((mode) => mode.active));

	const [open, setOpen] = useState<boolean>(false);
	const ref = useRef();

	const openMenu = () => setOpen(true);
	const closeMenu = () => setOpen(false);

	return (
		<Box>
			<Tooltip title={<Typography>Brightness Mode</Typography>}>
				<IconButton size={"small"} ref={ref} onClick={openMenu}>
					<Icon name={activeMode?.icon ?? "LightMode"} />
				</IconButton>
			</Tooltip>
			<BrightnessModeMenu open={open} anchorEl={ref.current} onClose={closeMenu} />
		</Box>
	);
};

export default BrightnessModeButton;

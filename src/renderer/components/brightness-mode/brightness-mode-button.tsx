import React from "react";
import { Box, Grow, IconButton, Tooltip, Typography } from "@mui/material";
import { selectActiveBrightnessMode, useAppSelector, useMenuState } from "@hooks";
import Icon from "../icon/icon";
import BrightnessModeMenu from "./brightness-mode-menu";

const BrightnessModeButton = () => {
	const activeMode = useAppSelector(selectActiveBrightnessMode);
	const { open, ref, openMenu, closeMenu } = useMenuState<HTMLButtonElement>();

	return (
		<Box width={36}>
			<Tooltip title={<Typography>Profile · {activeMode?.label ?? "Global"}</Typography>}>
				<Grow key={activeMode.id + "brightness-mode-button"} in={true}>
					<IconButton size={"small"} ref={ref} onClick={openMenu}>
						<Icon name={activeMode?.icon} />
					</IconButton>
				</Grow>
			</Tooltip>
			<BrightnessModeMenu open={open} anchorEl={ref.current} onClose={closeMenu} />
		</Box>
	);
};

export default BrightnessModeButton;

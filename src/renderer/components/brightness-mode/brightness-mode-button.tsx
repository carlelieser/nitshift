import React, { lazy, Suspense, useMemo, useRef, useState } from "react";
import { Box, Grow, IconButton, Tooltip, Typography } from "@mui/material";
import { useAppSelector } from "@hooks";
import Icon from "../icon/icon";

const BrightnessModeMenu = lazy(() => import("./brightness-mode-menu"));

const BrightnessModeButton = () => {
	const modes = useAppSelector((state) => state.app.brightnessModes);
	const activeMode = useMemo(() => modes.find((mode) => mode.active), [modes]);

	const [open, setOpen] = useState<boolean>(false);
	const ref = useRef();

	const openMenu = () => setOpen(true);
	const closeMenu = () => setOpen(false);

	return (
		<Box width={36}>
			<Tooltip title={<Typography>Brightness Mode · {activeMode?.label ?? "Global"}</Typography>}>
				<Grow key={activeMode.id + "brightness-mode-button"} in={true}>
					<IconButton size={"small"} ref={ref} onClick={openMenu}>
						<Icon name={activeMode?.icon} />
					</IconButton>
				</Grow>
			</Tooltip>
			<Suspense>
				<BrightnessModeMenu open={open} anchorEl={ref.current} onClose={closeMenu} />
			</Suspense>
		</Box>
	);
};

export default BrightnessModeButton;

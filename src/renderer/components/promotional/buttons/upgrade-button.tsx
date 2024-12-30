import React, { useEffect, useState } from "react";
import { RocketLaunchRoundedFilled } from "mui-symbols";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks";
import FeaturesDialog from "@components/dialogs/upgrade";
import { setMode } from "@reducers/app";
import ThemeButton from "@renderer/components/buttons/theme-button";
import { ColorButtonProps } from "../../buttons/color-button";

const UpgradeButton: React.FC<Partial<ColorButtonProps> & { context: "window-bar" | "main" }> = (props) => {
	const [open, setOpen] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => state.app.mode);
	const license = useAppSelector((state) => state.app.license);

	const openDialog = () => setOpen(true);
	const closeDialog = () => setOpen(false);

	useEffect(() => {
		if (open) {
			dispatch(setMode("expanded"));
		}
	}, [open]);

	return (
		<>
			<FeaturesDialog open={open} onClose={closeDialog} />
			{mode === "compact" && license !== "premium" && props.context === "window-bar" ? (
				<Tooltip title={<Typography>Go Pro</Typography>}>
					<IconButton onClick={openDialog} {...props}>
						<RocketLaunchRoundedFilled />
					</IconButton>
				</Tooltip>
			) : null}
			{mode === "expanded" && license !== "premium" && props.context === "main" ? (
				<ThemeButton
					variant={"contained"}
					disableElevation={true}
					sx={{ px: 2 }}
					startIcon={<RocketLaunchRoundedFilled />}
					onClick={openDialog}
					{...(props as ColorButtonProps)}
				>
					Go Pro
				</ThemeButton>
			) : null}
		</>
	);
};

export default UpgradeButton;

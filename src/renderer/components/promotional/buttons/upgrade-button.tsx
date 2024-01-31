import ColorButton from "@components/buttons/color-button";
import React, { useEffect, useState } from "react";
import { RocketLaunchRoundedFilled } from "mui-symbols";
import { ButtonProps, IconButton, Tooltip, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks";
import FeaturesDialog from "@components/dialogs/upgrade";
import { setMode } from "@reducers/app";

const UpgradeButton: React.FC<Partial<ButtonProps> & { context: "window-bar" | "main" }> = (props) => {
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
				<Tooltip title={<Typography>Upgrade to Pro</Typography>}>
					<IconButton onClick={openDialog} {...props}>
						<RocketLaunchRoundedFilled />
					</IconButton>
				</Tooltip>
			) : null}
			{mode === "expanded" && license !== "premium" && props.context === "main" ? (
				<ColorButton
					sx={{ px: 2 }}
					colour={"amber.500"}
					startIcon={<RocketLaunchRoundedFilled />}
					onClick={openDialog}
					{...(props as ButtonProps)}
				>
					<Typography variant={"button"}>Upgrade to Pro</Typography>
				</ColorButton>
			) : null}
		</>
	);
};

export default UpgradeButton;

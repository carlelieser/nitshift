import React from "react";
import { RocketLaunchRoundedFilled } from "mui-symbols";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks";
import FeaturesDialog from "@components/dialogs/upgrade";
import { setMode, setPrevMode, setTransitioning } from "@reducers/app";
import ThemeButton from "@renderer/components/buttons/theme-button";
import { ColorButtonProps } from "../../buttons/color-button";
import { batch } from "react-redux";
import { setUpgradeDialogOpen } from "../../../reducers/app";

const UpgradeButton: React.FC<Partial<ColorButtonProps> & { context: "window-bar" | "main" }> = (props) => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector((state) => state.app.mode);
	const license = useAppSelector((state) => state.app.license);
	const upgradeDialogOpen = useAppSelector((state) => state.app.upgradeDialogOpen);
	const prevMode = useAppSelector((state) => state.app.prevMode);

	const openDialog = () => {
		if (mode === "expanded") {
			batch(() => {
				dispatch(setPrevMode(mode));
				dispatch(setUpgradeDialogOpen(true));
			});
		} else {
			batch(() => {
				dispatch(setPrevMode(mode));
				dispatch(setTransitioning(true));
			});
			setTimeout(() => {
				batch(() => {
					dispatch(setUpgradeDialogOpen(true));
					dispatch(setMode("expanded"));
					dispatch(setTransitioning(false));
				});
			}, 250);
		}
	};
	const closeDialog = () => {
		if (prevMode === "compact") {
			dispatch(setTransitioning(true));
			dispatch(setUpgradeDialogOpen(false));
			setTimeout(() => {
				batch(() => {
					dispatch(setMode(prevMode));
					dispatch(setTransitioning(false));
				});
			}, 250);
		} else {
			dispatch(setUpgradeDialogOpen(false));
		}
	};

	return (
		<>
			<FeaturesDialog open={upgradeDialogOpen} onClose={closeDialog} />
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

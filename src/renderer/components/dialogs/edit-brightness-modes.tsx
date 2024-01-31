import React, { useEffect, useMemo, useState } from "react";
import Dialog, { DialogComponentProps } from "../dialog";
import { Add, LightMode } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "../../hooks";
import BrightnessMode from "../brightness-mode/brightness-mode";
import { Box, Grow, IconButton, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { cloneDeep } from "lodash";
import { setActiveBrightnessMode, setBrightnessModes } from "../../reducers/app";
import { createDefaultBrightnessMode } from "@common/utils";
import Icon from "../icon/icon";
import { batch } from "react-redux";

const EditBrightnessModesDialog: React.FC<DialogComponentProps> = (props) => {
	const dispatch = useAppDispatch();
	const modes = useAppSelector((state) => state.app.brightnessModes);
	const defaultBrightnessModes = useMemo(() => cloneDeep(modes), []);

	const activeBrightnessMode = useMemo(() => modes.find(({ active }) => active), [modes]);

	const [modeIndex, setModeIndex] = useState<number>(modes.findIndex((mode) => mode.active));

	const mode = useMemo(() => modes.find((_mode, index) => index === modeIndex), [modeIndex, modes]);

	const handleModeChange = (_event: React.SyntheticEvent, modeIndex: number) => setModeIndex(modeIndex);

	const resetModes = () => {
		batch(() => {
			dispatch(setBrightnessModes(defaultBrightnessModes));
			dispatch(
				setActiveBrightnessMode({
					id: defaultBrightnessModes.find(({ active }) => active).id,
					silent: true,
				})
			);
		});
	};

	const handleCancel = () => {
		resetModes();
		props.onClose();
	};

	const handleAddBrightnessMode = () => {
		const mode = {
			...createDefaultBrightnessMode("Mode", "LightMode", activeBrightnessMode.brightness, false),
			removable: true,
		};
		dispatch(setBrightnessModes([...modes, mode]));
		setModeIndex(modes.length);
	};

	const handleConfirm = () => {
		props.onClose();
		dispatch(setActiveBrightnessMode({ id: activeBrightnessMode.id, silent: true }));
	};

	useEffect(() => {
		if (!mode) {
			setModeIndex((prevIndex) => prevIndex - 1);
		}
	}, [mode, modeIndex]);

	return (
		<Dialog
			title={"Brightness Modes"}
			icon={<LightMode />}
			actions={[
				{
					label: "Cancel",
					onClick: handleCancel,
				},
				{
					label: "Reset",
					onClick: resetModes,
				},
				{
					label: "Confirm",
					onClick: handleConfirm,
				},
			]}
			{...props}
		>
			<Box height={"100%"} display={"flex"}>
				<Box height={"100%"} display={"flex"} flexDirection={"column"} borderRight={1} borderColor={"divider"}>
					<Tabs
						orientation={"vertical"}
						value={modeIndex}
						onChange={handleModeChange}
						variant={"scrollable"}
						scrollButtons={true}
						allowScrollButtonsMobile={true}
						sx={{ height: "100%" }}
					>
						{modes.map((mode, index) => (
							<Tooltip
								key={mode.id + "tab"}
								title={<Typography>{mode.label}</Typography>}
								placement={"right"}
							>
								<Tab
									icon={<Icon name={mode.icon} />}
									value={index}
									sx={{
										minWidth: 40,
									}}
								/>
							</Tooltip>
						))}
					</Tabs>
					<Box display={"flex"} alignItems={"center"} justifyContent={"center"} pb={2}>
						<IconButton color={"primary"} onClick={handleAddBrightnessMode}>
							<Add />
						</IconButton>
					</Box>
				</Box>
				{mode ? (
					<Box flexGrow={1} p={2}>
						<Grow key={mode.id} mountOnEnter={true} unmountOnExit={true} in={true}>
							<Box height={"100%"}>
								<BrightnessMode {...mode} />
							</Box>
						</Grow>
					</Box>
				) : null}
			</Box>
		</Dialog>
	);
};

export default EditBrightnessModesDialog;

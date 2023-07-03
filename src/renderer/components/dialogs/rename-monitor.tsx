import { Stack, TextField, Typography } from "@mui/material";
import Dialog, { DialogComponentProps } from "../dialog";
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../hooks";
import { redux } from "../../redux";
import { setMonitorName } from "../../reducers/app";
import { ipcRenderer } from "electron";

interface RenameMonitorDialogProps extends DialogComponentProps {
	monitorId: string;
	currentName: string;
}

const RenameMonitorDialog: React.FC<RenameMonitorDialogProps> = ({ open, monitorId, currentName, onClose }) => {
	const dispatch = useAppDispatch();

	const [name, setName] = useState<string>(currentName);

	const handleNameChange = (e) => {
		setName(e.target.value);
	};

	const handleResetName = () => {
		const state = redux.getState();
		const name = state.app.monitors.find((monitor) => monitor.id === monitorId)?.name;
		dispatch(
			setMonitorName({
				id: monitorId,
				nickname: name,
			})
		);
		onClose();
	};

	const handleConfirmNameChange = () => {
		dispatch(
			setMonitorName({
				id: monitorId,
				nickname: name,
			})
		);
		onClose();
	};

	const handleFocus = (e) => {
		e.target.select();
	};

	const handleKeyUp = (e) => {
		if (e.keyCode === 13) {
			handleConfirmNameChange();
		}
	};

	useEffect(() => {
		if (open) {
			setName(currentName);
			ipcRenderer.invoke("disable-auto-hide");
		} else {
			ipcRenderer.invoke("enable-auto-hide");
		}
	}, [open]);

	return (
		<Dialog
			title={"Rename monitor"}
			actions={[
				{
					label: "Reset to default",
					onClick: handleResetName,
				},
				{
					label: "Confirm",
					disabled: !name,
					onClick: handleConfirmNameChange,
				},
			]}
			onExited={() => {}}
			open={open}
			onClose={onClose}
		>
			<Stack p={3} spacing={2} alignItems={"center"} justifyContent={"center"} height={"100%"}>
				<Typography variant={"h2"} textTransform={"uppercase"} textAlign={"center"}>
					{name?.length ? name : currentName}
				</Typography>
				<TextField
					autoFocus={true}
					fullWidth={true}
					label={"New name"}
					placeholder={"Left monitor"}
					inputProps={{
						style: {
							textTransform: "uppercase",
						},
					}}
					value={name}
					onChange={handleNameChange}
					onFocus={handleFocus}
					onKeyUp={handleKeyUp}
				/>
			</Stack>
		</Dialog>
	);
};

export default RenameMonitorDialog;

import { Box, Paper, Stack, TextField, Typography } from "@mui/material";
import Dialog, { DialogComponentProps } from "../dialog";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch } from "@hooks";
import { redux } from "@redux";
import { setMonitorName } from "@reducers/app";
import { stubFalse } from "lodash";
import { MonitorRounded } from "mui-symbols";

const { ipcRenderer } = require("electron");

interface RenameMonitorDialogProps extends DialogComponentProps {
	monitorId: string;
	currentName: string;
}

const RenameMonitorDialog: React.FC<RenameMonitorDialogProps> = ({ open, monitorId, currentName, onClose }) => {
	const dispatch = useAppDispatch();

	const [name, setName] = useState<string>(currentName);
	const defaultName = useMemo(() => name, []);
	const ref = useRef<HTMLInputElement>();

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

	const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
		e.target.select();
	};

	const handleKeyUp: React.KeyboardEventHandler = (e) => {
		if (e.keyCode === 13) {
			handleConfirmNameChange();
		}
	};

	const handleCancel = () => {
		dispatch(
			setMonitorName({
				id: monitorId,
				nickname: defaultName,
			})
		);
		onClose();
	};

	useEffect(() => {
		if (open) {
			ref.current.focus();
			setName(currentName);
			ipcRenderer.invoke("app/auto-hide/disable");
		} else {
			ipcRenderer.invoke("app/auto-hide/enable");
		}
	}, [open]);

	return (
		<Dialog
			title={"Rename monitor"}
			icon={<MonitorRounded />}
			actions={[
				{
					label: "Cancel",
					onClick: handleCancel,
				},
				{
					label: "Reset",
					onClick: handleResetName,
				},
				{
					label: "Confirm",
					disabled: !name,
					onClick: handleConfirmNameChange,
				},
			]}
			onExited={stubFalse}
			open={open}
			onClose={onClose}
		>
			<Box height={"100%"} position={"relative"} display={"flex"}>
				<Box my={"auto"} width={"100%"}>
					<Stack p={3} py={8} spacing={2} alignItems={"center"} justifyContent={"center"}>
						<Typography
							variant={"h2"}
							textTransform={"uppercase"}
							textAlign={"center"}
							sx={{ wordWrap: "wrap", wordBreak: "break-all", whiteSpace: "pre", textWrap: "wrap" }}
						>
							{name?.length ? name : currentName}
						</Typography>
						<Box
							component={Paper}
							sx={{
								width: "100%",
								position: "sticky",
								bottom: 0,
								py: 2,
							}}
							elevation={0}
						>
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
								inputRef={ref}
								value={name}
								onChange={handleNameChange}
								onFocus={handleFocus}
								onKeyUp={handleKeyUp}
							/>
						</Box>
					</Stack>
				</Box>
			</Box>
		</Dialog>
	);
};

export default RenameMonitorDialog;

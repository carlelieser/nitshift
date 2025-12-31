import Dialog from "@components/dialog";
import { BugReport, Check, Exclamation } from "mui-symbols";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DialogComponentProps } from "../dialog";
import { Box, Grow, Stack, TextField, TextFieldProps, Typography } from "@mui/material";
import { ipcRenderer } from "electron";
import Link from "../link";
import Message from "../message";

const ReportABugDialog: React.FC<DialogComponentProps> = (props) => {
	const [title, setTitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [succeeded, setSucceeded] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);

	const handleTitleChange: TextFieldProps["onChange"] = (e) => setTitle(e.target.value);

	const handleDescriptionChange: TextFieldProps["onChange"] = (e) => setDescription(e.target.value);

	const handleConfirm = useCallback(async () => {
		setLoading(true);
		const result = await ipcRenderer.invoke("app/bug/report", {
			title,
			description
		});
		setSucceeded(result);
		setError(!result);
		setLoading(false);
	}, [title, description]);

	const reset = () => {
		setTitle("");
		setDescription("");
		setLoading(false);
		setSucceeded(false);
		setError(false);
	};

	const handleEdit = () => {
		setSucceeded(false);
		setError(false);
		setLoading(false);
	};

	const handleCancel = () => {
		props.onClose();
	};

	const handleExited = () => reset();

	const actions = useMemo(() => {
		const actions = [];

		actions.push({
			label: "Cancel",
			onClick: handleCancel
		});

		if (succeeded)
			actions.push({
				label: "Cool",
				onClick: handleConfirm
			});

		if (error) {
			actions.push({
				label: "Edit",
				onClick: handleEdit
			});
			actions.push({
				label: "Try Again",
				loading,
				onClick: handleConfirm
			});
		}

		if (!error && !succeeded)
			actions.push({
				label: "Confirm",
				loading,
				onClick: handleConfirm
			});

		return actions;
	}, [succeeded, error, loading, handleConfirm]);

	useEffect(() => {
		if (succeeded) {
			props.onClose();
		}
	}, [succeeded, props]);

	return (
		<Dialog title={"Report a Bug"} icon={<BugReport />} actions={actions} onExited={handleExited} {...props}>
			<Grow in={error} mountOnEnter={true} unmountOnExit={true}>
				<Box width={"100%"} height={"100%"}>
					<Message
						color={"error.main"}
						icon={<Exclamation />}
						title={"Oh no, an error!"}
						description={
							<Typography>
								Looks like we couldn't send that bug report. Please try again or shoot us an email at{" "}
								<Link href="mailto:support@glimmr.app?subject=Bug Report">support@glimmr.app</Link>
							</Typography>
						}
					/>
				</Box>
			</Grow>
			<Grow in={succeeded} mountOnEnter={true} unmountOnExit={true}>
				<Box width={"100%"} height={"100%"}>
					<Message
						color={"success.main"}
						icon={<Check />}
						title={"Success!"}
						description={<Typography>Your bug report has been submitted successfully!</Typography>}
					/>
				</Box>
			</Grow>
			<Grow in={!error && !succeeded} mountOnEnter={true} unmountOnExit={true}>
				<Stack p={3} width={"100%"} height={"100%"} spacing={2}>
					<TextField
						variant={"outlined"}
						label={"Title"}
						placeholder={"Something doesn't work"}
						onChange={handleTitleChange}
						disabled={loading}
					/>
					<TextField
						variant={"outlined"}
						label={"Description"}
						placeholder={"Tell us what's going on"}
						value={description}
						multiline={true}
						minRows={8}
						onChange={handleDescriptionChange}
						maxRows={8}
						disabled={loading}
					/>
				</Stack>
			</Grow>
		</Dialog>
	);
};

export default ReportABugDialog;

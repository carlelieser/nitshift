import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	AlertTitle,
	Button,
	CircularProgress,
	LinearProgress,
	linearProgressClasses,
	Snackbar,
	Stack,
	Typography,
} from "@mui/material";
import { common, teal } from "@mui/material/colors";
import { ACCESS_TOKEN, Release } from "../../main/updater";
import { app, ipcRenderer } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import { Info } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { createDirectory, removeDirectory } from "../../common/utils";
import DownloadWorker, { DownloadWorkerEvent, TransferStatus } from "../../main/download.worker";

const worker = new DownloadWorker();

const { execFile } = require("child_process");

interface UpdateSnackbarProps {
	release: Release | null;
	onClose: () => void;
}

const UpdateSnackbar: React.FC<UpdateSnackbarProps> = ({ release, onClose }) => {
	const [progress, setProgress] = useState<TransferStatus>(null);
	const [finished, setFinished] = useState<boolean>(false);

	const outputPath = useRef<string>();
	const downloading = useMemo(() => progress && progress.percentage !== 100, [progress]);

	const startDownload = async () => {
		const asset = release.assets[0];
		const appPath = await ipcRenderer.invoke("get-temp-path");
		const tmpPath = path.join(appPath, "glimmer-tmp");

		outputPath.current = path.join(tmpPath, asset.name);

		await removeDirectory(tmpPath);
		await createDirectory(tmpPath);

		worker.postMessage({
			url: asset.url,
			path: outputPath.current,
			options: {
				headers: {
					Authorization: `Bearer ${ACCESS_TOKEN}`,
					Accept: "application/octet-stream",
				},
			},
		});
	};

	useEffect(() => {
		if (finished) {
			execFile(outputPath.current, () => {
				ipcRenderer.invoke("quit");
			});
		}
	}, [finished]);

	useEffect(() => {
		if (release) setFinished(false);
	}, [release]);

	useEffect(() => {
		worker.addEventListener("message", (e: MessageEvent<DownloadWorkerEvent>) => {
			if (e.data.event === "progress") setProgress(e.data.data);
			if (e.data.event === "finished") setFinished(true);
		});
	}, []);

	return (
		<Snackbar open={!!release && !finished} onClose={onClose}>
			<Alert
				severity={"info"}
				icon={<Info sx={{ color: common.white }} />}
				onClose={onClose}
				sx={{ width: "100%", bgcolor: teal[500], color: common.white }}
				action={
					<LoadingButton loading={downloading} color={"inherit"} onClick={startDownload}>
						Update
					</LoadingButton>
				}
			>
				<AlertTitle>{downloading ? "Downloading" : "Update available"}</AlertTitle>
				{downloading ? (
					<Stack direction={"row"} width={"100%"} spacing={1} alignItems={"center"}>
						<LinearProgress
							sx={{
								width: "100%",
								[`&.${linearProgressClasses.colorPrimary}`]: {
									backgroundColor: "rgba(255, 255, 255, 0.3)",
								},
								[`& .${linearProgressClasses.bar}`]: {
									borderRadius: 5,
									backgroundColor: teal[900],
								},
							}}
							variant={"determinate"}
							value={progress.percentage}
						/>
						<Typography variant={"button"} sx={{ opacity: 0.7 }}>
							{Math.floor(progress.percentage)}%
						</Typography>
					</Stack>
				) : (
					<Stack>
						{release?.body}
						<Typography variant={"overline"} sx={{ opacity: 0.7 }}>
							{release?.tag_name}
						</Typography>
					</Stack>
				)}
			</Alert>
		</Snackbar>
	);
};

export default UpdateSnackbar;

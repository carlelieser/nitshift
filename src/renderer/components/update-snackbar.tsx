import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	AlertTitle,
	LinearProgress,
	linearProgressClasses,
	Portal,
	Snackbar,
	Stack,
	Typography
} from "@mui/material";
import { common, teal } from "@mui/material/colors";
import { createDirectory, removeDirectory } from "@common/utils";
import path from "path";
import { Info } from "mui-symbols";
import LoadingButton from "@mui/lab/LoadingButton";
import DownloadWorker from "@renderer/download.worker?worker";
import { DownloadWorkerEvent, TransferStatus } from "@renderer/download.worker";
import { execFile } from "child_process";

import { ipcRenderer } from "electron";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setRelease } from "@reducers/app";
import { Release } from "@common/types";
import update from "immutability-helper";

const worker = new DownloadWorker();

const UpdateSnackbar: React.FC = () => {
	const release = useAppSelector((state) => state.app.release);
	const dispatch = useAppDispatch();
	const [open, setOpen] = useState<boolean>(false);
	const [releaseCopy, setReleaseCopy] = useState<Release>();

	const [progress, setProgress] = useState<TransferStatus>(null);
	const [finished, setFinished] = useState<boolean>(false);

	const outputPath = useRef<string>();
	const downloading = useMemo(() => progress && progress.percentage !== 100, [progress]);

	const title = useMemo(() => {
		if (!downloading && !finished) return "Update available";
		if (downloading) return "Downloading update...";
		if (finished) return "All done, restarting now!";
	}, [downloading, finished]);

	const startDownload = async () => {
		const asset = release.assets[0];
		const appPath = await ipcRenderer.invoke("app/temp-path");
		const tmpPath = path.join(appPath, "glimmer-tmp");

		outputPath.current = path.join(tmpPath, asset.name);

		await removeDirectory(tmpPath);
		await createDirectory(tmpPath);

		worker.postMessage({
			url: asset.url,
			path: outputPath.current,
			options: {
				headers: {
					Authorization: `Bearer ${ipcRenderer.sendSync("key/path", "git")}`,
					Accept: "application/octet-stream"
				}
			}
		});
	};

	const handleClose = () => {
		setOpen(false);
		dispatch(setRelease(null));
	};

	useEffect(() => {
		if (finished) {
			execFile(outputPath.current, () => {
				ipcRenderer.invoke("app/quit");
			});
		}
	}, [finished]);

	useEffect(() => {
		if (release) {
			setOpen(true);
			setReleaseCopy((prevReleaseCopy) =>
				update(prevReleaseCopy, {
					$set: release
				})
			);
		}
	}, [release]);

	useEffect(() => {
		worker.addEventListener("message", (e: MessageEvent<DownloadWorkerEvent>) => {
			if (e.data.event === "progress") setProgress(e.data.data);
			if (e.data.event === "finished") setFinished(true);
		});
	}, []);

	return (
		<Portal>
			<Snackbar open={open} onClose={handleClose}>
				<Alert
					severity={"info"}
					icon={<Info sx={{ color: common.white }} />}
					onClose={handleClose}
					sx={{ width: "100%", height: "100%", bgcolor: teal[500], color: common.white }}
					action={
						<LoadingButton loading={downloading} color={"inherit"} onClick={startDownload}>
							Update
						</LoadingButton>
					}
				>
					<AlertTitle>{title}</AlertTitle>
					{downloading || finished ? (
						<Stack direction={"row"} width={"100%"} spacing={1} alignItems={"center"}>
							<LinearProgress
								sx={{
									width: "100%",
									[`&.${linearProgressClasses.colorPrimary}`]: {
										backgroundColor: "rgba(255, 255, 255, 0.3)"
									},
									[`& .${linearProgressClasses.bar}`]: {
										borderRadius: 5,
										backgroundColor: teal[900]
									}
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
							{releaseCopy?.body}
							<Typography variant={"overline"} sx={{ opacity: 0.7 }}>
								{releaseCopy?.tag_name}
							</Typography>
						</Stack>
					)}
				</Alert>
			</Snackbar>
		</Portal>
	);
};

export default UpdateSnackbar;

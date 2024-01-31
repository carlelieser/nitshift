import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setRefreshed } from "@reducers/app";
import { RefreshOutlined } from "mui-symbols";

const MonitorsRefreshed = () => {
	const mode = useAppSelector((state) => state.app.mode);
	const refreshed = useAppSelector((state) => state.app.refreshed);
	const dispatch = useAppDispatch();
	const [open, setOpen] = useState<boolean>(false);

	const handleClose = () => setOpen(false);

	useEffect(() => {
		if (refreshed && mode === "expanded") setOpen(true);
	}, [refreshed, mode]);

	useEffect(() => {
		if (!open) dispatch(setRefreshed(false));
	}, [open]);

	return (
		<Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
			<Alert icon={<RefreshOutlined />} elevation={8} sx={{ width: "100%" }} onClose={handleClose}>
				Monitors refreshed
			</Alert>
		</Snackbar>
	);
};

export default MonitorsRefreshed;

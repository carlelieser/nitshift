import { Alert, Portal, Snackbar } from "@mui/material";
import { Celebration } from "mui-symbols";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setReceivedPremium } from "@reducers/app";

const ReceivedPremium = () => {
	const [open, setOpen] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const receivedPremium = useAppSelector((state) => state.app.receivedPremium);

	const handleClose = () => setOpen(false);

	useEffect(() => {
		if (receivedPremium) setOpen(true);
	}, [receivedPremium]);

	useEffect(() => {
		if (!open) dispatch(setReceivedPremium(false));
	}, [open]);

	return (
		<Portal>
			<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
				<Alert sx={{ width: "100%" }} icon={<Celebration />} onClose={handleClose}>
					Welcome aboard! You're all set.
				</Alert>
			</Snackbar>
		</Portal>
	);
};

export default ReceivedPremium;

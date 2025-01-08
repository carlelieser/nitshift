import { Button } from "@mui/material";
import { BugReport } from "mui-symbols";
import { useState } from "react";
import ReportABugDialog from "@dialogs/report-a-bug";

const ReportBugButton = () => {
	const [open, setOpen] = useState<boolean>(false);

	const openDialog = () => setOpen(true);
	const closeDialog = () => setOpen(false);

	return (
		<>
			<ReportABugDialog open={open} onClose={closeDialog} />
			<Button startIcon={<BugReport />} color={"error"} onClick={openDialog}>
				Report Bug
			</Button>
		</>
	);
};

export default ReportBugButton;

import { Button } from "@mui/material";
import { BugReport } from "mui-symbols";
import ReportABugDialog from "@dialogs/report-a-bug";
import { useState } from "react";

const ReportABug = () => {
	const [open, setOpen] = useState<boolean>(false);

	const openDialog = () => setOpen(true);
	const closeDialog = () => setOpen(false);

	return (
		<>
			<ReportABugDialog open={open} onClose={closeDialog} />
			<Button startIcon={<BugReport />} color={"error"} onClick={openDialog}>
				Report a Bug
			</Button>
		</>
	);
};

export default ReportABug;

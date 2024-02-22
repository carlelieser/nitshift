import { Button } from "@mui/material";
import { BugReport } from "mui-symbols";
import { lazy, Suspense, useState } from "react";

const ReportABugDialog = lazy(() => import("@dialogs/report-a-bug"));

const ReportABug = () => {
	const [open, setOpen] = useState<boolean>(false);

	const openDialog = () => setOpen(true);
	const closeDialog = () => setOpen(false);

	return (
		<>
			<Suspense>
				<ReportABugDialog open={open} onClose={closeDialog} />
			</Suspense>
			<Button startIcon={<BugReport />} color={"error"} onClick={openDialog}>
				Report a Bug
			</Button>
		</>
	);
};

export default ReportABug;

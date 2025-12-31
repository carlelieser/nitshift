import { Button } from "@mui/material";
import { BugReport } from "mui-symbols";
import ReportABugDialog from "@dialogs/report-a-bug";
import { useMenuState } from "@hooks";

const ReportBugButton = () => {
	const { open, openMenu, closeMenu } = useMenuState();

	return (
		<>
			<ReportABugDialog open={open} onClose={closeMenu} />
			<Button startIcon={<BugReport />} color={"error"} onClick={openMenu}>
				Report Bug
			</Button>
		</>
	);
};

export default ReportBugButton;

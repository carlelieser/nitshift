import { Button } from "@mui/material";
import { shell } from "electron";
import { EditSquare } from "mui-symbols";

const ReviewButton = () => {
	const handleClick = () => {
		shell.openExternal("https://www.trustpilot.com/review/glimmr.app");
	};

	return (
		<Button startIcon={<EditSquare />} onClick={handleClick}>
			Review
		</Button>
	);
};

export default ReviewButton;

import { Button } from "@mui/material";
import { shell } from "electron";
import { OpenInNew } from "mui-symbols";

const ReviewButton = () => {
	const handleClick = () => {
		shell.openExternal("https://www.trustpilot.com/review/glimmr.app");
	};

	return (
		<Button startIcon={<OpenInNew />} onClick={handleClick}>
			Leave a Review
		</Button>
	);
};

export default ReviewButton;

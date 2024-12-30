import { Button } from "@mui/material";
import { Send } from "mui-symbols";
import { loadUserId } from "../../storage";
import { shell } from "electron";
import { MouseEventHandler } from "react";

const EmailUsButton = () => {
	const handleOpenEmail: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();
		e.stopPropagation();
		shell.openExternal(`mailto:support@glimmr.app?subject=[ID: ${loadUserId()}]`);
	};

	return (
		<Button startIcon={<Send />} color={"success"} onClick={handleOpenEmail}>
			Email Us
		</Button>
	);
};

export default EmailUsButton;

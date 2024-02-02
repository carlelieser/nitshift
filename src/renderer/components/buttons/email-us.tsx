import Link from "../link";
import { Button } from "@mui/material";
import { Send } from "mui-symbols";
import { loadUserId } from "../../storage";

const EmailUs = () => {
	return (
		<Link href={`mailto:support@glimmr.app?subject=[ID: ${loadUserId()}]`}>
			<Button startIcon={<Send />} color={"success"}>
				Email Us
			</Button>
		</Link>
	);
};

export default EmailUs;

import React from "react";
import { Alert, Portal, Snackbar, SnackbarProps } from "@mui/material";

const PreCheckoutSnackbar: React.FC<Pick<SnackbarProps, "open" | "onClose">> = ({ open, onClose }) => {
	return (
		<Portal>
			<Snackbar open={open} onClose={onClose} autoHideDuration={null}>
				<Alert severity={"info"} onClose={onClose as any} sx={{ width: "100%" }} elevation={12}>
					Once you've completed your purchase, you can activate your license by verifying your email above.
				</Alert>
			</Snackbar>
		</Portal>
	);
};

export default PreCheckoutSnackbar;

import React, { useEffect, useState } from "react";
import { Stack, Tooltip, Typography } from "@mui/material";
import { ShoppingCartCheckout } from "mui-symbols";
import stripeLogo from "@assets/img/stripe.svg";
import { ipcRenderer, shell } from "electron";
import PreCheckoutSnackbar from "@components/promotional/snackbars/pre-checkout";
import ActivateLicenseDialog from "@dialogs/activate-license";
import ColorButton from "@buttons/color-button";
import { useAppSelector } from "@renderer/hooks";

interface CheckoutButtonProps {
	price: number;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ price }) => {
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
	const [activationDialogOpen, setActivationDialogOpen] = useState<boolean>(false);
	const userId = useAppSelector((state) => state.app.userId);

	const handleCheckout = async () => {
		await shell.openExternal(
			`${import.meta.env.VITE_HOST}/checkout?price=${price}&customer-id=${userId}&key=${userId}`
		);
		setActivationDialogOpen(true);
		setSnackbarOpen(true);
	};

	useEffect(() => {
		if (!activationDialogOpen) ipcRenderer.invoke("app/auto-hide/enable");
	}, [activationDialogOpen]);

	return (
		<>
			<PreCheckoutSnackbar open={snackbarOpen} onClose={() => setSnackbarOpen(false)} />
			<ActivateLicenseDialog open={activationDialogOpen} onClose={() => setActivationDialogOpen(false)} />
			<Tooltip title={<Typography>Open secure checkout with Stripe</Typography>}>
				<ColorButton
					colour={"blue.500"}
					fullWidth={true}
					startIcon={<ShoppingCartCheckout />}
					onClick={handleCheckout}
				>
					<Stack direction={"row"} alignItems={"center"} spacing={1}>
						<Typography variant={"button"} whiteSpace={"pre"}>
							Checkout with
						</Typography>
						<img src={stripeLogo} width={48} />
					</Stack>
				</ColorButton>
			</Tooltip>
		</>
	);
};

export default CheckoutButton;

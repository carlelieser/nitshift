import React, { useEffect, useState } from "react";
import { CircularProgress, Stack, Tooltip, Typography } from "@mui/material";
import { ShoppingCartCheckout } from "mui-symbols";
import stripeLogo from "@assets/img/stripe.svg";
import { ipcRenderer, shell } from "electron";
import PreCheckoutSnackbar from "@components/promotional/snackbars/pre-checkout";
import ActivateLicenseDialog from "@dialogs/activate-license";
import ColorButton from "@buttons/color-button";

interface CheckoutButtonProps {
	price: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ price }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
	const [activationDialogOpen, setActivationDialogOpen] = useState<boolean>(false);

	const handleCheckout = async () => {
		setLoading(true);
		const priceObject = await ipcRenderer.invoke("stripe/create-price", Number(price.split(".").join("")));
		const link = await ipcRenderer.invoke("stripe/create-payment-link", priceObject.id);
		await ipcRenderer.invoke("app/auto-hide/disable");
		await shell.openExternal(link.url);
		setLoading(false);
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
			<Tooltip title={<Typography>Start secure checkout with Stripe</Typography>}>
				<ColorButton
					colour={"blue.500"}
					fullWidth={true}
					color={"inherit"}
					startIcon={loading ? <CircularProgress size={24} color={"inherit"} /> : <ShoppingCartCheckout />}
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

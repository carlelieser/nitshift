import React, { useContext, useMemo, useState } from "react";
import { Alert, Collapse, Stack } from "@mui/material";
import { blue } from "@mui/material/colors";
import CheckoutButton from "@promotional/buttons/checkout-button";
import PriceSelect from "@components/promotional/price-select";
import { FeaturesDialogScrollContext } from "@components/dialogs/upgrade";

const PriceSelectAndCheckout = () => {
	const [price, setPrice] = useState<string>();
	const scrollTop = useContext(FeaturesDialogScrollContext);

	const shouldShowAlert = useMemo(() => scrollTop > 0, [scrollTop]);

	return (
		<Stack>
			<Collapse in={shouldShowAlert} mountOnEnter={true} unmountOnExit={true}>
				<Alert elevation={1} square={true} severity={"success"}>
					Select a price that feels right for you
				</Alert>
			</Collapse>
			<Stack
				zIndex={10}
				direction={"row"}
				alignItems={"center"}
				spacing={1}
				sx={{ bgcolor: blue["500"], borderRadius: 4, overflow: "hidden" }}
			>
				<PriceSelect onChange={setPrice} />
				<CheckoutButton price={price} />
			</Stack>
		</Stack>
	);
};

export default PriceSelectAndCheckout;

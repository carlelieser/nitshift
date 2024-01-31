import React, { useEffect, useRef, useState } from "react";
import { Paper, Tooltip, Typography } from "@mui/material";
import ColorButton from "@buttons/color-button";
import { ArrowDropDown } from "mui-symbols";
import PriceMenu from "@components/promotional/price-menu";
import { ipcRenderer } from "electron";

interface PriceSelectProps {
	onChange: (price: string) => void;
}

const PriceSelect: React.FC<PriceSelectProps> = ({ onChange }) => {
	const [price, setPrice] = useState<string>(ipcRenderer.sendSync("key/path", "price.amounts")[0]);
	const [description, setDescription] = useState<string>(
		ipcRenderer.sendSync("key/path", "price.descriptions")[price]
	);
	const [priceMenuOpen, setPriceMenuOpen] = useState<boolean>(false);

	const ref = useRef<HTMLButtonElement>();

	const openPriceMenu = () => setPriceMenuOpen(true);
	const closePriceMenu = () => setPriceMenuOpen(false);

	const handlePriceChange = (price: string, description: string) => {
		setPrice(price);
		setDescription(description);
	};

	useEffect(() => {
		onChange(price);
	}, [price]);

	return (
		<>
			<Tooltip title={<Typography>Select a fair price</Typography>}>
				<ColorButton
					colour={"blue.900"}
					ref={ref}
					disableElevation={true}
					component={Paper}
					sx={{
						height: "100%",
						px: 4,
						borderRadius: 4,
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
					}}
					endIcon={<ArrowDropDown />}
					onClick={openPriceMenu}
				>
					<Typography variant={"button"}>{`$${price}`}</Typography>
				</ColorButton>
			</Tooltip>
			<PriceMenu
				open={priceMenuOpen}
				price={price}
				description={description}
				anchorEl={ref.current}
				onClose={closePriceMenu}
				onChange={handlePriceChange}
			/>
		</>
	);
};

export default PriceSelect;

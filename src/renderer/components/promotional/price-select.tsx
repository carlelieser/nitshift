import React, { useEffect, useRef, useState } from "react";
import { Paper, Tooltip, Typography } from "@mui/material";
import ColorButton from "@buttons/color-button";
import { ArrowDropDown } from "mui-symbols";
import PriceMenu from "@components/promotional/price-menu";

interface PriceSelectProps {
	onChange: (price: number) => void;
}

const PriceSelect: React.FC<PriceSelectProps> = ({ onChange }) => {
	const [price, setPrice] = useState<number>();
	const [priceMenuOpen, setPriceMenuOpen] = useState<boolean>(false);

	const ref = useRef<HTMLButtonElement>();

	const openPriceMenu = () => setPriceMenuOpen(true);
	const closePriceMenu = () => setPriceMenuOpen(false);

	const handlePriceChange = (price: number) => {
		setPrice(price);
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
					fullWidth={false}
					disableElevation={true}
					component={Paper}
					sx={{
						height: "100%",
						px: 4,
						borderRadius: 4,
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0
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
				anchorEl={ref.current}
				onClose={closePriceMenu}
				onChange={handlePriceChange}
			/>
		</>
	);
};

export default PriceSelect;

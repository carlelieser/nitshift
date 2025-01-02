import React, { useEffect, useState } from "react";
import {
	IconButton,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	Menu,
	MenuItem,
	Slide,
	Stack,
	Typography
} from "@mui/material";
import { Close, RadioButtonCheckedOutlined, RadioButtonUncheckedOutlined } from "mui-symbols";
import { request } from "@common/fetch";

interface PriceMenuProps {
	open: boolean;
	price: number;
	anchorEl: HTMLButtonElement;
	onClose: () => void;
	onChange: (price: number) => void;
}

const PriceMenu: React.FC<PriceMenuProps> = ({ open, price: selectedPrice, anchorEl, onClose, onChange }) => {
	const [prices, setPrices] = useState<Array<number>>([]);

	useEffect(() => {
		onChange(prices[0]);
	}, [prices]);

	useEffect(() => {
		request("/api/prices")
			.then((response) => response.json())
			.then(setPrices);
	}, []);

	return (
		<Menu
			open={open}
			TransitionComponent={Slide}
			TransitionProps={
				{
					direction: "up"
				} as any
			}
			anchorEl={anchorEl}
			onClose={onClose}
		>
			<ListSubheader>
				<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} py={1}>
					<Typography variant={"subtitle2"} sx={{ pr: 3 }}>
						Select a fair price
					</Typography>
					<IconButton size={"small"} onClick={onClose}>
						<Close />
					</IconButton>
				</Stack>
			</ListSubheader>
			{prices.map((price) => (
				<MenuItem
					key={price}
					onClick={() => {
						onChange(price);
						onClose();
					}}
				>
					<ListItemIcon>
						{selectedPrice === price ? (
							<RadioButtonCheckedOutlined color={"primary"} />
						) : (
							<RadioButtonUncheckedOutlined />
						)}
					</ListItemIcon>
					<ListItemText primary={<Typography fontWeight={500}>{price}</Typography>} />
				</MenuItem>
			))}
		</Menu>
	);
};

export default PriceMenu;

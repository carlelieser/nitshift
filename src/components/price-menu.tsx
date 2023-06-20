import React from "react";
import { ListItemIcon, ListItemText, ListSubheader, Menu, MenuItem, Typography } from "@mui/material";
import { RadioButtonChecked, RadioButtonUnchecked } from "@mui/icons-material";

interface PriceDescriptions {
	[price: string]: string;
}

export const prices = ["1.99", "2.99", "3.99", "4.99", "5.99"];

export const descriptions: PriceDescriptions = {
	"1.99": "Because good things come in small prices too.",
	"2.99": "Change you can find in your sofa cushions!",
	"3.99": "Sometimes the best things in life aren't free, they're three ninety-nine.",
	"4.99": "Less than your morning latte!",
	"5.99": "The cost of happiness, possibly.",
};

interface PriceMenuProps {
	open: boolean;
	price: string;
	description: string;
	anchorEl: HTMLDivElement;
	onClose: () => void;
	onChange: (price: string, description: string) => void;
}

const PriceMenu: React.FC<PriceMenuProps> = ({ open, price: selectedPrice, anchorEl, onClose, onChange }) => {
	return (
		<Menu open={open} anchorEl={anchorEl} onClose={onClose}>
			<ListSubheader>Select a fair price</ListSubheader>
			{Object.keys(descriptions).map((price) => (
				<MenuItem
					key={price}
					onClick={() => {
						onChange(price, descriptions[price]);
						onClose();
					}}
				>
					<ListItemIcon>
						{selectedPrice === price ? <RadioButtonChecked color={"primary"} /> : <RadioButtonUnchecked />}
					</ListItemIcon>
					<ListItemText
						primary={<Typography fontWeight={500}>{price}</Typography>}
						secondary={
							<Typography sx={{ opacity: 0.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{descriptions[price]}</Typography>
						}
					/>
				</MenuItem>
			))}
		</Menu>
	);
};

export default PriceMenu;

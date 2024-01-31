import React, { useMemo } from "react";
import {
	IconButton,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	Menu,
	MenuItem,
	Slide,
	Stack,
	Typography,
} from "@mui/material";
import { Close, RadioButtonCheckedOutlined, RadioButtonUncheckedOutlined } from "mui-symbols";
import { ipcRenderer } from "electron";

interface PriceDescriptions {
	[price: string]: string;
}

interface PriceMenuProps {
	open: boolean;
	price: string;
	description: string;
	anchorEl: HTMLButtonElement;
	onClose: () => void;
	onChange: (price: string, description: string) => void;
}

const PriceMenu: React.FC<PriceMenuProps> = ({ open, price: selectedPrice, anchorEl, onClose, onChange }) => {
	const descriptions = useMemo(() => ipcRenderer.sendSync("key/path", "price.descriptions") as PriceDescriptions, []);

	return (
		<Menu
			open={open}
			TransitionComponent={Slide}
			TransitionProps={
				{
					direction: "up",
				} as any
			}
			anchorEl={anchorEl}
			onClose={onClose}
		>
			<ListSubheader>
				<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
					Select a fair price
					<IconButton size={"small"} onClick={onClose}>
						<Close />
					</IconButton>
				</Stack>
			</ListSubheader>
			{Object.keys(descriptions).map((price) => (
				<MenuItem
					key={price}
					onClick={() => {
						onChange(price, descriptions[price]);
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
					<ListItemText
						primary={<Typography fontWeight={500}>{price}</Typography>}
						secondary={
							<Typography
								sx={{
									opacity: 0.7,
									fontSize: 14,
									whiteSpace: "pre-wrap",
								}}
							>
								{descriptions[price]}
							</Typography>
						}
					/>
				</MenuItem>
			))}
		</Menu>
	);
};

export default PriceMenu;

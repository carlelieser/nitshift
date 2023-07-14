import React from "react";
import { ListItemIcon, ListItemText, Menu, MenuItem, MenuProps } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks";
import Icon from "./icon";
import { setActiveBrightnessMode } from "../reducers/app";

const BrightnessModeMenu: React.FC<MenuProps> = (props) => {
	const dispatch = useAppDispatch();
	const modes = useAppSelector((state) => state.app.brightnessModes);
	const activeMode = useAppSelector((state) => state.app.brightnessModes?.find((mode) => mode.active));

	return (
		<Menu
			{...props}
			anchorOrigin={{
				horizontal: "center",
				vertical: "bottom",
			}}
			PaperProps={{
				sx: {
					ml: -6,
					mt: 1,
				},
			}}
		>
			{modes.map((mode) => {
				const selectMode = () => {
					dispatch(setActiveBrightnessMode(mode.id));
					props.onClose({}, "backdropClick");
				};

				return (
					<MenuItem key={`mode-item-${mode.id}`} selected={mode.id === activeMode?.id} onClick={selectMode}>
						<ListItemIcon>
							<Icon name={mode.icon} sx={{ opacity: 0.7 }} />
						</ListItemIcon>
						<ListItemText>{mode.label}</ListItemText>
					</MenuItem>
				);
			})}
		</Menu>
	);
};

export default BrightnessModeMenu;

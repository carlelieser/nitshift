import React from "react";
import { ListItemIcon, ListItemText, Menu, MenuItem, MenuProps } from "@mui/material";
import { selectActiveBrightnessMode, useAppDispatch, useAppSelector } from "../../hooks";
import { setActiveBrightnessMode } from "../../reducers/app";
import Icon from "../icon/icon";

const BrightnessModeMenu: React.FC<MenuProps> = (props) => {
	const dispatch = useAppDispatch();
	const modes = useAppSelector((state) => state.app.brightnessModes);
	const activeMode = useAppSelector(selectActiveBrightnessMode);

	return (
		<Menu
			{...props}
			anchorOrigin={{
				horizontal: "center",
				vertical: "bottom"
			}}
			PaperProps={{
				sx: {
					ml: -6,
					mt: 1,
					minWidth: 150,
					minHeight: 200
				}
			}}
		>
			{modes.map((mode) => {
				const selectMode = () => {
					dispatch(setActiveBrightnessMode({ id: mode.id, silent: true }));
					props.onClose({}, "backdropClick");
				};

				return (
					<MenuItem key={`mode-item-${mode.id}`} selected={mode.id === activeMode?.id} onClick={selectMode}>
						<ListItemIcon>
							<Icon name={mode.icon} />
						</ListItemIcon>
						<ListItemText>{mode.label}</ListItemText>
					</MenuItem>
				);
			})}
		</Menu>
	);
};

export default BrightnessModeMenu;

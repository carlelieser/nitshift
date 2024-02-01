import React from "react";
import { alpha, Menu, MenuProps, Slide } from "@mui/material";

export interface OverlayMenuProps extends Omit<MenuProps, "onChange" | "onClose"> {
	onClose: () => void;
}

const OverlayMenu: React.FC<OverlayMenuProps> = (props) => {
	return (
		<Menu
			{...props}
			TransitionComponent={Slide}
			TransitionProps={
				{
					direction: "up"
				} as any
			}
			PaperProps={{
				sx: {
					width: "100%"
				}
			}}
			slotProps={{
				root: {
					slotProps: {
						backdrop: {
							sx: {
								bgcolor: (theme) => alpha(theme.palette.common.black, 0.4),
								borderRadius: 4
							}
						}
					}
				}
			}}
		>
			{props.children}
		</Menu>
	);
};

export default OverlayMenu;

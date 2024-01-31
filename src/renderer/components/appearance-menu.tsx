import React from "react";
import { ListItemText, MenuItem, Radio } from "@mui/material";
import { appearances } from "@common/utils";
import { capitalize, omit } from "lodash";
import { Appearance } from "@common/types";
import OverlayMenu, { OverlayMenuProps } from "./overlay-menu";

export interface AppearanceMenuProps extends OverlayMenuProps {
	value: string;
	onChange: (appearance: Appearance) => void;
}

const AppearanceMenu: React.FC<AppearanceMenuProps> = (props) => {
	return (
		<OverlayMenu {...omit(props, "onChange")}>
			{appearances.map((id) => (
				<MenuItem
					key={"appearance-" + id}
					value={id}
					selected={props.value === id}
					onClick={() => {
						props.onChange(id);
						props.onClose();
					}}
				>
					<Radio checked={props.value === id} sx={{ pointerEvents: "none" }} />
					<ListItemText>{capitalize(id)}</ListItemText>
				</MenuItem>
			))}
		</OverlayMenu>
	);
};

export default AppearanceMenu;

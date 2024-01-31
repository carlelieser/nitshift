import React from "react";
import { ListItemText, MenuItem, Radio } from "@mui/material";
import { capitalize, omit } from "lodash";
import OverlayMenu, { OverlayMenuProps } from "@renderer/components/overlay-menu";
import { AppState } from "@common/types";
import { modes } from "@common/utils";

export interface ModeMenuProps extends OverlayMenuProps {
	value: string;
	onChange: (mode: AppState["mode"]) => void;
	onClose: () => void;
}

const ModeMenu: React.FC<ModeMenuProps> = (props) => {
	return (
		<OverlayMenu {...omit(props, "onChange")}>
			{modes.map((id) => (
				<MenuItem
					key={"mode-" + id}
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

export default ModeMenu;

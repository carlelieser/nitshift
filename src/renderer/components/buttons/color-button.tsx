import { Button, ButtonProps, styled } from "@mui/material";
import { getMUIColor } from "@utils";
import Color from "color";
import * as colors from "@mui/material/colors";

type ColorButtonProps = Omit<ButtonProps, "color"> & {
	colour: `${keyof typeof colors}.${keyof typeof colors.amber}`;
};

const ColorButton = styled(Button)<ColorButtonProps>(({ theme, colour }) => {
	const selectedColor = getMUIColor(theme, colour);
	const textColor = theme.palette.getContrastText(selectedColor);
	const hoverColor = Color(selectedColor).darken(0.2).hex();
	return {
		transition: theme.transitions.create(["background-color", "color"]),
		display: "flex",
		alignItems: "center",
		color: textColor,
		backgroundColor: selectedColor,
		"&:hover": {
			backgroundColor: hoverColor
		}
	};
});

export default ColorButton;

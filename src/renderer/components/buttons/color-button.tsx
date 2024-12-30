import { Button, ButtonProps, Stack, useTheme } from "@mui/material";
import { getMUIColor } from "@utils";
import Color from "color";
import * as colors from "@mui/material/colors";
import { useMemo } from "react";

export type ColorButtonProps = Omit<ButtonProps, "color"> & {
	colour: `${keyof typeof colors}.${keyof typeof colors.amber}`;
};

const ColorButton = (props: ColorButtonProps) => {
	const theme = useTheme();

	const selectedColor = useMemo(() => getMUIColor(theme, props.colour), [theme, props.colour]);
	const textColor = useMemo(() => theme.palette.getContrastText(selectedColor), [theme.palette, selectedColor]);
	const hoverColor = useMemo(() => Color(selectedColor).darken(0.2).hex(), [selectedColor]);

	const baseSx = useMemo(() => {
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
	}, [theme.transitions, textColor, selectedColor, hoverColor]);

	const sx = useMemo(() => {
		return {
			...baseSx,
			...(props.sx ?? {})
		};
	}, [baseSx, props.sx]);

	return (
		<Button
			{...props}
			sx={sx}
			startIcon={
				<Stack sx={{ opacity: 0.7 }} alignItems={"center"} justifyContent={"center"}>
					{props.startIcon}
				</Stack>
			}
		/>
	);
};

export default ColorButton;

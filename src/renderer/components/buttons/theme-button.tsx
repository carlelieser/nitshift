import ColorButton, { ColorButtonProps } from "./color-button";
import { useAppSelector } from "../../hooks";
import { useMemo } from "react";

export type ThemeButtonProps = ColorButtonProps;

const ThemeButton = (props: Partial<ThemeButtonProps>) => {
	const appearance = useAppSelector((state) => state.app.appearance);
	const color = useMemo(() => (appearance === "light" ? "grey.900" : "grey.100"), [appearance]);
	return <ColorButton colour={color} {...props} />;
};

export default ThemeButton;

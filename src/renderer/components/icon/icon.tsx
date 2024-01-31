import React, { useEffect, useState } from "react";
import { IconProps as MUIIconProps } from "@mui/material";
import * as icons from "mui-symbols/dist/index";

interface IconProps extends MUIIconProps {
	name: string;
}

const Icon: React.FC<IconProps> = (props) => {
	const [Component, setComponent] = useState<React.FC>();

	useEffect(() => {
		setComponent(icons[props.name]);
	}, [props.name]);

	return Component ? <Component {...props} /> : null;
};

export default Icon;

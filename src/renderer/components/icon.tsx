import React, { useEffect, useState } from "react";
import { Icon as MUIIcon, IconProps as MUIIconProps } from "@mui/material";

interface IconProps extends MUIIconProps {
	name: string;
}

const Icon: React.FC<IconProps> = (props) => {
	const [Component, SetComponent] = useState(() => (props) => <MUIIcon {...props} />);

	useEffect(() => {
		import(/* webpackMode: "eager" */ `@mui/icons-material/${props.name}.js`)
			.then((component) => {
				const Component = component.default;
				SetComponent(() => (props) => <Component {...props} />);
			})
			.catch(console.log);
	}, [props.name]);

	return <Component {...props} />;
};

export default Icon;

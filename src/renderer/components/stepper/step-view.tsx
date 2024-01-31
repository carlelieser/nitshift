import React, { PropsWithChildren } from "react";
import { Paper, SxProps } from "@mui/material";
import { merge } from "lodash";

interface StepViewProps extends PropsWithChildren<any> {
	variant?: "outlined" | "elevation";
	sx?: SxProps;
}

const StepView: React.FC<StepViewProps> = (props) => {
	const { children, variant = "elevation", sx = {} } = props;

	return (
		<Paper {...props} variant={variant} sx={merge({}, { py: 2, borderRadius: 3, height: "100%" }, sx)}>
			{children}
		</Paper>
	);
};

export default StepView;

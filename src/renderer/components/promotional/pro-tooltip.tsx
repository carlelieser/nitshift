import React from "react";
import { Stack, Tooltip, Typography } from "@mui/material";
import { useAppSelector } from "@hooks";

interface ProTooltip {
	title: string;
	children: React.ReactElement;
}

const ProTooltip: React.FC<ProTooltip> = ({ title, children }) => {
	const license = useAppSelector((state) => state.app.license);
	return (
		<Tooltip
			title={
				<Stack spacing={-1}>
					{license === "free" ? (
						<Typography variant={"overline"} sx={{ opacity: 0.7, mb: 0 }}>
							Pro Feature
						</Typography>
					) : null}
					<Typography>{title}</Typography>
				</Stack>
			}
		>
			{children}
		</Tooltip>
	);
};

export default ProTooltip;

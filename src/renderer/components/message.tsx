import { Avatar, Stack, Typography, TypographyProps } from "@mui/material";
import React from "react";

interface MessageProps {
	title: string;
	description: React.ReactNode;
	color: TypographyProps["color"];
	icon: React.ReactNode;
}

const Message: React.FC<MessageProps> = ({ title, description, color, icon }) => {
	return (
		<Stack
			spacing={2}
			width={"100%"}
			height={"100%"}
			alignItems={"center"}
			justifyContent={"center"}
			textAlign={"center"}
			p={2}
		>
			{icon ? <Avatar sx={{ bgcolor: color }}>{icon}</Avatar> : null}
			<Typography variant={"h4"}>{title}</Typography>
			<Typography variant={"body2"} color={"text.secondary"}>
				{description}
			</Typography>
		</Stack>
	);
};

export default Message;

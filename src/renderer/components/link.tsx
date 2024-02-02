import React from "react";
import { Link as MUILink } from "@mui/material";
import { shell } from "electron";

interface LinkProps {
	href: string;
	children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, children }) => {
	const handleClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		shell.openExternal(href);
	};
	return (
		<MUILink onClick={handleClick} sx={{ cursor: "pointer", textDecoration: "none" }}>
			{children}
		</MUILink>
	);
};

export default Link;

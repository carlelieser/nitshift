import React from "react";
import { Menu } from "@mui/material";

interface MonitorMenuProps {
	target: string;
	open: boolean;
}

const MonitorMenu: React.FC<MonitorMenuProps> = ({ open }) => {
	return <Menu open={open}></Menu>;
};

export default MonitorMenu;

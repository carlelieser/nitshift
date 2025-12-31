import React, { useMemo } from "react";
import { Grow, IconButton, IconButtonProps, IconProps } from "@mui/material";
import Icon from "./icon";
import IconMenu from "./icon-menu";
import { randomUUID } from "crypto";
import { useMenuState } from "@hooks";

interface IconSelectProps {
	value: string;
	onChange: (icon: string) => void;
	buttonProps?: IconButtonProps;
	iconProps?: IconProps;
}

const IconSelect: React.FC<IconSelectProps> = ({ value, onChange, buttonProps = {}, iconProps = {} }) => {
	const id = useMemo(() => randomUUID(), [value]);
	const { open, ref, openMenu, closeMenu } = useMenuState<HTMLButtonElement>();

	return (
		<>
			<Grow key={id} in={true}>
				<IconButton ref={ref} onClick={openMenu} {...buttonProps}>
					<Icon name={value} {...iconProps} />
				</IconButton>
			</Grow>
			<IconMenu anchorEl={ref.current} value={value} onChange={onChange} open={open} onClose={closeMenu} />
		</>
	);
};

export default IconSelect;

import React, { useMemo, useRef, useState } from "react";
import {
	IconButton,
	Slider as MUISlider,
	SliderOwnProps,
	SliderValueLabelProps,
	Stack,
	Tooltip,
	Typography
} from "@mui/material";
import { Add, Remove } from "mui-symbols";

export interface SliderProps {
	value: number;
	onChange: (value: number) => void;
	color?: string;
	className?: string;
	disabled?: boolean;
	disableTooltip?: boolean;
	percentage?: boolean;
}

const CustomValueLabel: React.FC<SliderValueLabelProps> = (props) => {
	return (
		<Tooltip placement={"top"} enterDelay={0} {...props} title={<Typography>{props.value}</Typography>}>
			{props.children}
		</Tooltip>
	);
};

const Slider: React.FC<SliderProps> = ({
	value,
	disabled = false,
	disableTooltip = false,
	color = "primary",
	onChange,
	percentage = false
}) => {
	const [shouldShowTooltip, setShouldShowTooltip] = useState<boolean>(disableTooltip ? false : null);
	const timeout = useRef(null);

	const valueLabelDisplay = useMemo(
		() => (shouldShowTooltip === null ? "auto" : shouldShowTooltip ? "on" : "off"),
		[shouldShowTooltip]
	);

	const showSliderTooltip = () => {
		if (disableTooltip) return;
		if (timeout.current) clearTimeout(timeout.current);
		timeout.current = setTimeout(() => setShouldShowTooltip(null), 1000);
		setShouldShowTooltip(true);
	};

	const decrement = () => {
		showSliderTooltip();
		onChange(value - 1);
	};

	const increment = () => {
		showSliderTooltip();
		onChange(value + 1);
	};

	const handleChange: SliderOwnProps["onChange"] = (_event, value) => onChange(value as number);

	return (
		<Stack flex={1} direction={"row"} alignItems={"center"} spacing={2} p={1} width={"100%"}>
			<IconButton disabled={value === 0 || disabled} onClick={decrement} color={"inherit"}>
				<Remove />
			</IconButton>
			<MUISlider
				className={"brightness-slider"}
				min={0}
				max={100}
				sx={{
					color
				}}
				slots={{
					valueLabel: CustomValueLabel
				}}
				disabled={disabled}
				valueLabelDisplay={valueLabelDisplay}
				valueLabelFormat={(value) => (percentage ? `${value}%` : value)}
				value={value}
				onChange={handleChange}
			/>
			<IconButton disabled={value === 100 || disabled} onClick={increment} color={"inherit"}>
				<Add />
			</IconButton>
		</Stack>
	);
};

export default Slider;

import React, { useMemo, useRef, useState } from "react";
import { IconButton, Slider, SliderValueLabelProps, Stack, Tooltip, Typography } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface BrightnessSliderProps {
	value: number;
	onChange: (value: number) => void;
	color?: string;
	className?: string;
	disabled?: boolean;
	disableTooltip?: boolean;
}

const CustomValueLabel = (props: SliderValueLabelProps) => {
	const { children, value } = props;

	return (
		<Tooltip enterTouchDelay={0} placement="top" title={<Typography>{value}</Typography>}>
			{children}
		</Tooltip>
	);
};

const BrightnessSlider: React.FC<BrightnessSliderProps> = ({
	value,
	disabled = false,
	className = "",
	disableTooltip = false,
	color = "primary",
	onChange,
}) => {
	const [shouldShowTooltip, setShouldShowTooltip] = useState<boolean>(!disableTooltip);
	const timeout = useRef(null);

	const valueLabelDisplay = useMemo(() => (shouldShowTooltip === null ? "auto" : shouldShowTooltip ? "on" : "off"), [shouldShowTooltip]);

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

	const handleChange = (event: Event, value: number, activeThumb: number) => onChange(value);

	return (
		<Stack direction={"row"} alignItems={"center"} spacing={2} p={1} width={"100%"}>
			<IconButton disabled={value === 0 || disabled} onClick={decrement} color={"inherit"}>
				<Remove sx={{ width: 18, height: 18 }} />
			</IconButton>
			<Slider
				className={"brightness-slider"}
				min={0}
				max={100}
				slots={{
					valueLabel: CustomValueLabel,
				}}
				sx={{
					color,
				}}
				disabled={disabled}
				valueLabelDisplay={valueLabelDisplay}
				value={value}
				onChange={handleChange}
			/>
			<IconButton disabled={value === 100 || disabled} onClick={increment} color={"inherit"}>
				<Add sx={{ width: 18, height: 18 }} />
			</IconButton>
		</Stack>
	);
};

export default BrightnessSlider;

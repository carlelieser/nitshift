import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import {
	IconButton,
	Slider as MUISlider,
	SliderOwnProps,
	SliderValueLabelProps,
	Stack,
	Tooltip,
	Typography,
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

export const SliderContext = createContext({
	percentage: false,
	value: 0,
});

const CustomValueLabel = (props: SliderValueLabelProps) => {
	const { children, value } = props;
	const context = useContext(SliderContext);

	return (
		<Tooltip
			enterTouchDelay={0}
			placement="top"
			title={
				<Typography>
					{value}
					{context.percentage ? "%" : null}
				</Typography>
			}
		>
			{children}
		</Tooltip>
	);
};

const Slider: React.FC<SliderProps> = ({
	value,
	disabled = false,
	disableTooltip = false,
	color = "primary",
	onChange,
	percentage = false,
}) => {
	const [shouldShowTooltip, setShouldShowTooltip] = useState<boolean>(!disableTooltip);
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
		<SliderContext.Provider
			value={{
				percentage,
				value,
			}}
		>
			<Stack direction={"row"} alignItems={"center"} spacing={2} p={1} width={"100%"}>
				<IconButton disabled={value === 0 || disabled} onClick={decrement} color={"inherit"}>
					<Remove />
				</IconButton>
				<MUISlider
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
					<Add />
				</IconButton>
			</Stack>
		</SliderContext.Provider>
	);
};

export default Slider;

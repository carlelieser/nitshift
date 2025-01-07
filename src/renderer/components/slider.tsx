import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	IconButton,
	Slider as MUISlider,
	SliderOwnProps,
	SliderProps as MUISliderProps,
	SliderValueLabelProps,
	Stack,
	Tooltip,
	Typography
} from "@mui/material";
import { Add, Remove } from "mui-symbols";
import { diff } from "just-diff";
import update from "immutability-helper";
import { omit } from "lodash";

export interface SliderProps {
	value?: MUISliderProps["value"];
	min?: number;
	max?: number;
	onChange?: (value: MUISliderProps["value"]) => void;
	color?: string;
	className?: string;
	disabled?: boolean;
	disableTooltip?: boolean;
	percentage?: boolean;
}

const CustomValueLabel: React.FC<SliderValueLabelProps> = (props) => {
	return (
		<Tooltip placement={"top"} enterDelay={0} {...(omit(props, "valueLabelDisplay", "valueLabelFormat"))} title={<Typography>{props.value}</Typography>}>
			{props.children}
		</Tooltip>
	);
};

const Slider: React.FC<SliderProps> = ({
	value,
	min = 0,
	max = 100,
	disabled = false,
	disableTooltip = false,
	color = "primary",
	onChange,
	percentage = false
}) => {
	const [shouldShowTooltip, setShouldShowTooltip] = useState<boolean>(disableTooltip ? false : null);
	const timeout = useRef(null);
	const [lastChangedIndex, setLastChangedIndex] = useState<number>(1);
	const [prevValue, setPrevValue] = useState<SliderProps["value"]>(0);

	useEffect(() => {
		if (Array.isArray(value) && prevValue) {
			const index = diff(prevValue as number[], value)?.[0]?.path?.[0] as number;
			if (index !== undefined) setLastChangedIndex(index);
		}
	}, [value]);

	useEffect(() => {
		setPrevValue(value);
	}, [value]);

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
		if (typeof value === "number") onChange(value - 1);
		if (Array.isArray(value))
			onChange(
				update(value, {
					[lastChangedIndex]: {
						$set: value[lastChangedIndex] - 1
					}
				})
			);
	};

	const increment = () => {
		showSliderTooltip();
		if (typeof value === "number") onChange(value + 1);
		if (Array.isArray(value))
			onChange(
				update(value, {
					[lastChangedIndex]: {
						$set: value[lastChangedIndex] + 1
					}
				})
			);
	};

	const handleChange: SliderOwnProps["onChange"] = (_event, value) => onChange(value);

	return (
		<Stack flex={1} direction={"row"} alignItems={"center"} spacing={2} p={1} width={"100%"}>
			<IconButton disabled={value === 0 || disabled} onClick={decrement} color={"inherit"}>
				<Remove />
			</IconButton>
			<MUISlider
				className={"brightness-slider"}
				min={min}
				max={max}
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

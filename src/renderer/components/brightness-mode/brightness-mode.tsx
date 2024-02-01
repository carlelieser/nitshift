import React, { useMemo } from "react";
import {
	Box,
	Divider,
	IconButton,
	InputAdornment,
	Paper,
	Radio,
	Stack,
	TextField,
	TextFieldProps,
	Tooltip,
	Typography
} from "@mui/material";
import { BrightnessModeData } from "@common/types";
import Slider, { SliderProps } from "../slider";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { editBrightnessMode, removeBrightnessMode, setActiveBrightnessMode } from "../../reducers/app";
import { Delete, EditOutlined } from "mui-symbols";
import IconSelect from "../icon/icon-select";
import { batch } from "react-redux";

const BrightnessMode: React.FC<BrightnessModeData> = (props) => {
	const modes = useAppSelector((state) => state.app.brightnessModes);
	const active = useMemo(() => !!modes.find(({ active, id }) => active && id === props.id), [modes, props.id]);
	const dispatch = useAppDispatch();

	const defaultLabel = useMemo(() => props.label, []);

	const canRemove = useMemo(() => !active && defaultLabel !== "Custom", [active]);

	const handleBrightnessChange: SliderProps["onChange"] = (value) => {
		batch(() => {
			dispatch(editBrightnessMode({ ...props, brightness: value }));
			if (active) dispatch(setActiveBrightnessMode({ id: props.id, silent: true }));
		});
	};

	const handleLabelChange: TextFieldProps["onChange"] = (e) => {
		dispatch(
			editBrightnessMode({
				...props,
				label: e.target.value.toLowerCase().includes("custom") ? e.target.value.slice(-1) : e.target.value
			})
		);
	};

	const handleIconChange = (icon) => dispatch(editBrightnessMode({ ...props, icon }));

	const handleRemove = () => dispatch(removeBrightnessMode(props.id));

	const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		dispatch(setActiveBrightnessMode({ id: e.target.value, silent: true }));

	return (
		<Paper sx={{ borderRadius: 4, height: "100%", overflow: "hidden", position: "relative" }}>
			<Radio
				checked={active}
				value={props.id}
				onChange={handleActiveChange}
				sx={{ position: "absolute", mt: 1, ml: 1, left: 0 }}
			/>
			<Stack height={"100%"}>
				<Stack alignItems={"center"} justifyContent={"center"} gap={2} py={2} flexGrow={1}>
					<IconSelect
						buttonProps={{
							sx: {
								width: 64,
								height: 64
							},
							color: "primary",
							size: "large"
						}}
						iconProps={{
							sx: {
								fontSize: 36
							}
						}}
						value={props.icon}
						onChange={handleIconChange}
					/>
					<TextField
						placeholder={defaultLabel}
						InputProps={{
							startAdornment: (
								<InputAdornment position={"start"}>
									<EditOutlined />
								</InputAdornment>
							)
						}}
						value={props.label}
						disabled={props.label.toLowerCase() === "custom"}
						onChange={handleLabelChange}
						variant={"outlined"}
					/>
				</Stack>
				<Divider sx={{ mt: 2, mb: 0 }} />
				<Stack direction={"row"}>
					<Box
						display={"flex"}
						alignItems={"center"}
						justifyContent={"center"}
						borderRight={1}
						borderColor={"divider"}
						height={"100%"}
					>
						<Tooltip
							title={
								canRemove ? null : (
									<Typography>
										{defaultLabel === "Custom"
											? "You can't remove this mode!"
											: "You can't remove an active mode!"}
									</Typography>
								)
							}
						>
							<Box px={1}>
								<IconButton disabled={!canRemove} color={"error"} onClick={handleRemove}>
									<Delete />
								</IconButton>
							</Box>
						</Tooltip>
					</Box>
					<Slider value={props.brightness} percentage={true} onChange={handleBrightnessChange} />
				</Stack>
			</Stack>
		</Paper>
	);
};

export default BrightnessMode;

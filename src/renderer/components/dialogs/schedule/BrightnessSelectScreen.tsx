import { Box, Collapse, Stack, Typography } from "@mui/material";
import React, { createRef, useContext, useMemo } from "react";
import Color from "color";
import Slider, { SliderProps } from "@renderer/components/slider";
import { ScheduleContext } from "./context";

function getColorAtProgress(
	startColor: [number, number, number, number],
	endColor: [number, number, number, number],
	progress: number
): [number, number, number, number] {
	if (progress < 0 || progress > 1) {
		throw new Error("Progress must be a value between 0 and 1");
	}

	let resultColor: [number, number, number, number] = [0, 0, 0, 0];

	for (let i = 0; i < 4; i++) {
		resultColor[i] = startColor[i] + (endColor[i] - startColor[i]) * progress;
	}

	return resultColor;
}

const BrightnessSelectScreen = () => {
	const context = useContext(ScheduleContext);
	const container = createRef<HTMLDivElement>();
	const brightnessColor = useMemo(
		() => Color(getColorAtProgress([68, 34, 120, 1], [255, 255, 255, 1], context.brightness / 100)).hexa(),
		[context.brightness]
	);
	const brightnessTextColor = useMemo(() => (Color(brightnessColor).isLight() ? "#000" : "#FFF"), [brightnessColor]);
	const handleBrightnessChange: SliderProps["onChange"] = (brightness) => context.setBrightness(brightness as number);

	return (
		<Box px={2}>
			<Stack
				sx={{
					flex: 1,
					bgcolor: brightnessColor,
					color: brightnessTextColor,
					borderRadius: 4,
					py: 4
				}}
				alignItems={"center"}
				justifyContent={"center"}
			>
				<Stack direction={"row"} justifyContent={"center"} ref={container} overflow={"hidden"}>
					{context.brightness
						.toString()
						.split("")
						.map((char, index) => {
							return (
								<Collapse
									key={`brightness-value-${index}-${char}`}
									in={true}
									mountOnEnter={true}
									unmountOnExit={true}
									sx={{
										display: "inline-block"
									}}
								>
									<Typography variant={"h3"} fontWeight={800} display={"inline-block"}>
										{char}
									</Typography>
								</Collapse>
							);
						})}
					<Typography variant={"h3"} sx={{ opacity: 0.7 }}>
						%
					</Typography>
				</Stack>
				<Slider
					color={"inherit"}
					value={context.brightness}
					disableTooltip={true}
					onChange={handleBrightnessChange}
				/>
			</Stack>
		</Box>
	);
};

export default BrightnessSelectScreen;

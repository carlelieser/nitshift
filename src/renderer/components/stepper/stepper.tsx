import React, { createContext, useMemo } from "react";
import { Box, IconButton, Slide, Stack, SvgIcon, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "mui-symbols";
import { TransitionGroup } from "react-transition-group";

interface Step {
	icon?: typeof SvgIcon;
	title: string;
	component: React.ReactNode;
}

interface StepperProps {
	steps: Array<Step>;
	activeStep: number;
	onChange: (step: number) => void;
}

export const StepperContext = createContext({
	steps: [],
	activeStep: 0,
});

const Stepper: React.FC<StepperProps> = ({ steps, activeStep, onChange }) => {
	const Icon = useMemo(() => steps[activeStep].icon, [activeStep]);

	const goToNextStep = () => onChange(activeStep + 1);
	const goToPrevStep = () => onChange(activeStep - 1);

	return (
		<StepperContext.Provider
			value={{
				steps,
				activeStep,
			}}
		>
			<Stack spacing={2} height={"100%"}>
				<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
					<IconButton disabled={activeStep === 0} onClick={goToPrevStep}>
						<ChevronLeft />
					</IconButton>
					<Stack direction={"row"} alignItems={"center"} spacing={1}>
						{Icon ? <Icon opacity={0.7} /> : null}
						<Typography variant={"h6"}>{steps[activeStep].title}</Typography>
					</Stack>
					<IconButton disabled={activeStep === steps.length - 1} onClick={goToNextStep}>
						<ChevronRight />
					</IconButton>
				</Stack>
				<Box display={"flex"} flex={1} flexDirection={"column"}>
					<TransitionGroup>
						<Slide direction={"up"} key={`step-${activeStep}`}>
							<Box>{steps[activeStep].component}</Box>
						</Slide>
					</TransitionGroup>
				</Box>
			</Stack>
		</StepperContext.Provider>
	);
};

export default Stepper;

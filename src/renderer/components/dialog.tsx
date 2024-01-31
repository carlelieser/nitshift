import React, { useMemo } from "react";
import { alpha, Avatar, Box, Button, IconButton, Modal, Paper, Portal, Slide, Stack, Typography } from "@mui/material";
import { Close, KeyboardArrowRight } from "mui-symbols";
import { stubFalse } from "lodash";
import { common, teal } from "@mui/material/colors";
import { useAppSelector } from "../hooks";
import { maskStyles } from "../utils";

export interface DialogComponentProps {
	open: boolean;
	onClose: () => void;
}

interface Action {
	label: string;
	disabled?: boolean;
	onClick: () => void;
}

export interface DialogProps extends DialogComponentProps {
	title: string;
	icon?: React.ReactNode;
	actions?: Array<Action>;
	children: React.ReactNode;
	scrollContent?: "y" | "x-hidden";
	onEntered?: () => void;
	onExited?: () => void;
}

const Dialog: React.FC<DialogProps> = ({
	open,
	icon,
	title,
	children,
	actions,
	scrollContent = "x-hidden",
	onClose,
	onEntered = stubFalse,
	onExited = stubFalse,
}) => {
	const appearance = useAppSelector((state) => state.app.appearance);
	const focused = useAppSelector((state) => state.app.focused);

	const isOpen = useMemo(() => (focused ? open : false), [open, focused]);

	return (
		<Portal>
			<Modal
				open={isOpen}
				onClose={onClose}
				keepMounted={false}
				hideBackdrop={true}
				disablePortal={true}
				closeAfterTransition={true}
				disableRestoreFocus={true}
				sx={{ outline: "none" }}
			>
				<Slide
					direction={"up"}
					in={isOpen}
					onEntered={onEntered}
					onExited={onExited}
					mountOnEnter={true}
					unmountOnExit={true}
				>
					<Paper
						sx={{
							borderRadius: 4,
							width: "100%",
							height: "100%",
							outline: "none",
							overflow: "hidden",
						}}
						style={maskStyles}
						variant={"outlined"}
						elevation={0}
					>
						<Box width={"100%"} height={"100%"} display={"flex"} flexDirection={"column"}>
							<Stack
								component={Paper}
								direction={"row"}
								spacing={2}
								alignItems={"center"}
								p={2}
								py={1}
								justifyContent={"space-between"}
								sx={{
									zIndex: 20,
								}}
								variant={"elevation"}
								elevation={1}
								square={true}
							>
								<Stack direction={"row"} alignItems={"center"} spacing={2}>
									{icon ? (
										<Avatar
											sx={{
												bgcolor: alpha(appearance === "light" ? teal[500] : common.white, 0.08),
												color: teal[500],
												width: 36,
												height: 36,
											}}
										>
											<Stack alignItems={"center"} sx={{ opacity: 0.7 }}>
												{icon}
											</Stack>
										</Avatar>
									) : null}
									<Typography variant={"h6"} fontFamily={"roboto"}>
										{title}
									</Typography>
								</Stack>
								<IconButton onClick={onClose}>
									<Close />
								</IconButton>
							</Stack>
							<Box
								flex={1}
								sx={scrollContent === "y" ? { overflowY: "scroll" } : { overflowX: "hidden" }}
							>
								{children}
							</Box>
							{actions?.length ? (
								<Stack
									component={Paper}
									direction={"row"}
									spacing={1}
									alignItems={"center"}
									justifyContent={"end"}
									p={2}
									py={1}
									sx={{
										zIndex: 20,
									}}
									elevation={2}
									variant={"elevation"}
									square={true}
								>
									{actions.map(({ label, disabled = false, onClick }, index) => {
										const isPrimary = index === actions.length - 1;
										const color = isPrimary ? "primary" : "inherit";
										return (
											<Button
												key={`dialog-action-${label}`}
												size={"small"}
												color={color}
												endIcon={isPrimary ? <KeyboardArrowRight /> : null}
												sx={{ opacity: isPrimary ? 1 : 0.5 }}
												disabled={disabled}
												onClick={onClick}
											>
												{label}
											</Button>
										);
									})}
								</Stack>
							) : null}
						</Box>
					</Paper>
				</Slide>
			</Modal>
		</Portal>
	);
};

export default Dialog;

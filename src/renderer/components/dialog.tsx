import React from "react";
import { Divider, IconButton, Paper, Stack, Typography, Modal, Box, Button, Slide, Portal, Grow } from "@mui/material";
import { Close } from "@mui/icons-material";
import { ipcRenderer } from "electron";
import { stubFalse } from "lodash";

export interface DialogComponentProps {
	open: boolean;
	onClose: () => void;
}

interface Action {
	label: string;
	disabled?: boolean;
	onClick: () => void;
}

interface DialogProps extends DialogComponentProps {
	title: string;
	actions?: Array<Action>;
	children: React.ReactNode;
	scrollContent?: "y" | "x-hidden";
	onEntered?: () => void;
	onExited?: () => void;
}

const Dialog: React.FC<DialogProps> = ({
	open,
	title,
	children,
	actions,
	scrollContent = "x-hidden",
	onClose,
	onEntered = stubFalse,
	onExited = stubFalse,
}) => {
	return (
		<Portal>
			<Modal
				open={open}
				onClose={onClose}
				disableRestoreFocus={true}
				keepMounted={false}
				hideBackdrop={true}
				closeAfterTransition={true}
				sx={{ outline: "none" }}
			>
				<Grow in={open} onEntered={onEntered} onExited={onExited}>
					<Paper
						sx={{
							borderRadius: 4,
							width: "100%",
							height: "100%",
							outline: "none",
							overflow: "hidden",
						}}
						variant={"outlined"}
					>
						<Box width={"100%"} height={"100%"} display={"flex"} flexDirection={"column"}>
							<Stack direction={"row"} spacing={1} alignItems={"center"} p={2} py={1}>
								<IconButton onClick={onClose}>
									<Close />
								</IconButton>
								<Typography variant={"h6"} fontFamily={"roboto"}>
									{title}
								</Typography>
							</Stack>
							<Divider />
							<Box flex={1} sx={scrollContent === "y" ? { overflowY: "scroll" } : { overflowX: "hidden" }}>
								{children}
							</Box>
							{actions?.length ? (
								<>
									<Divider />
									<Stack direction={"row"} spacing={2} alignItems={"center"} justifyContent={"end"} p={2} py={1}>
										{actions.map(({ label, disabled = false, onClick }, index) => {
											const isPrimary = index === actions.length - 1;
											const color = isPrimary ? "primary" : "inherit";
											return (
												<Button
													key={`dialog-action-${label}`}
													color={color}
													sx={{ opacity: isPrimary ? 1 : 0.5 }}
													disabled={disabled}
													onClick={onClick}
												>
													{label}
												</Button>
											);
										})}
									</Stack>
								</>
							) : null}
						</Box>
					</Paper>
				</Grow>
			</Modal>
		</Portal>
	);
};

export default Dialog;

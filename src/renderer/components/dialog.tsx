import React from "react";
import { Divider, IconButton, Paper, Stack, Typography, Modal, Box, Button, Slide } from "@mui/material";
import { Close } from "@mui/icons-material";

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
	onReset: () => void;
}

const Dialog: React.FC<DialogProps> = ({ open, title, children, actions, scrollContent = "x-hidden", onClose, onReset }) => {
	return (
		<Modal open={open} onClose={onClose} keepMounted={false} hideBackdrop={true} closeAfterTransition={true} sx={{ outline: "none" }}>
			<Slide direction={"up"} in={open} onExited={onReset}>
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
									{actions.map(({ label, disabled = false, onClick }) => (
										<Button key={`dialog-action-${label}`} disabled={disabled} onClick={onClick}>
											{label}
										</Button>
									))}
								</Stack>
							</>
						) : null}
					</Box>
				</Paper>
			</Slide>
		</Modal>
	);
};

export default Dialog;

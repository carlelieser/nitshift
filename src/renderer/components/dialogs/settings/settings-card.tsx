import React, { forwardRef, useState } from "react";
import { Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Dialog, { DialogProps } from "@components/dialog";
import { stubFalse } from "lodash";
import { ChevronRight } from "mui-symbols";

type PopupProps = Pick<DialogProps, "title" | "icon"> & { children: React.ReactNode };

interface SettingsCardProps {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	icon: React.ReactNode;
	onClick?: React.UIEventHandler<HTMLButtonElement>;
	visible?: boolean;
	value?: React.ReactNode;
	disableChip?: boolean;
	popup?: PopupProps;
	disable?: boolean;
}

const SettingsCard = forwardRef<HTMLButtonElement, SettingsCardProps>(
	(
		{
			title,
			icon,
			subtitle,
			visible = true,
			value,
			onClick = stubFalse,
			popup = null,
			disable = false,
			disableChip = false
		},
		ref
	) => {
		const [open, setOpen] = useState<boolean>(false);

		const handleClose = () => setOpen(false);

		return visible ? (
			<>
				{popup ? (
					<Dialog title={popup.title} icon={popup.icon} open={open} onClose={handleClose}>
						<Stack spacing={2} p={2}>
							{popup.children}
						</Stack>
					</Dialog>
				) : null}
				<Button
					sx={{
						borderRadius: 3,
						px: 3,
						textAlign: "left",
						justifyContent: "start"
					}}
					disabled={disable}
					onClick={(e) => {
						onClick(e);
						if (popup) setOpen(true);
					}}
					startIcon={
						<Paper
							elevation={3}
							sx={{
								p: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: "100%",
								boxShadow: "none"
							}}
							variant={"elevation"}
						>
							{icon}
						</Paper>
					}
					endIcon={
						popup ? (
							<ChevronRight />
						) : value ? (
							<Stack pr={2} alignItems={"center"}>
								{disableChip ? (
									value
								) : (
									<Chip
										color={"default"}
										label={
											<Stack direction={"row"} alignItems={"center"} justifyContent={"center"}>
												{value}
											</Stack>
										}
									/>
								)}
							</Stack>
						) : null
					}
					ref={ref}
					variant={"text"}
					color={"inherit"}
				>
					<Stack direction={"row"} alignItems={"start"} spacing={2} p={2} flex={1}>
						<Stack justifyContent={"flex-start"} gap={0} sx={{ textTransform: "none" }}>
							<Typography fontWeight={500}>{title}</Typography>
							{subtitle ? (
								<Typography variant={"body2"} color={"text.secondary"}>
									{subtitle}
								</Typography>
							) : null}
						</Stack>
					</Stack>
				</Button>
			</>
		) : null;
	}
);

export default SettingsCard;

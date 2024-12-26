import React, { forwardRef, useState } from "react";
import { Button, Chip, Stack, Typography } from "@mui/material";
import Dialog, { DialogProps } from "@components/dialog";
import { stubFalse } from "lodash";

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
					startIcon={icon}
					endIcon={
						value ? (
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
				>
					<Stack direction={"row"} alignItems={"start"} spacing={2} p={2} flex={1}>
						<Stack justifyContent={"flex-start"} sx={{ textTransform: "none" }}>
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

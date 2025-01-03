import React, { forwardRef, useMemo, useState } from "react";
import { Button, Chip, Collapse, Paper, Stack, Typography } from "@mui/material";
import Dialog, { DialogProps } from "@components/dialog";
import { ChevronRight, KeyboardArrowDown, KeyboardArrowUp } from "mui-symbols";
import { useAppSelector } from "@renderer/hooks";

type PopupProps = Pick<DialogProps, "title" | "icon"> & { children: React.ReactNode };

interface SettingsCardProps {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	isPremium?: boolean;
	icon: React.ReactNode;
	endIcon?: React.ReactNode;
	onClick?: React.UIEventHandler<HTMLButtonElement>;
	isCollapsible?: boolean;
	defaultCollapsed?: boolean;
	visible?: boolean;
	value?: React.ReactNode;
	disableChip?: boolean;
	popup?: PopupProps;
	disable?: boolean;
	children?: React.ReactNode;
	onClose?: () => void;
	wrap?: boolean;
}

const SettingsCard = forwardRef<HTMLButtonElement, SettingsCardProps>(
	(
		{
			title,
			icon,
			endIcon,
			subtitle,
			isPremium,
			isCollapsible,
			defaultCollapsed = true,
			visible = true,
			value,
			children,
			onClick,
			onClose,
			popup = null,
			disable = false,
			disableChip = false,
			wrap = true
		},
		ref
	) => {
		const [popupOpen, setPopupOpen] = useState<boolean>(false);
		const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
		const license = useAppSelector((state) => state.app.license);
		const disabled = useMemo(() => disable || (isPremium && license === "free"), [disable, isPremium, license]);

		const handleClose = () => {
			setPopupOpen(false);
			if (onClose) onClose();
		};

		return visible ? (
			<>
				{popup ? (
					<Dialog title={popup.title} icon={popup.icon} open={popupOpen} onClose={handleClose}>
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
						justifyContent: "start",
						cursor: onClick ? "pointer" : "default"
					}}
					disabled={disabled}
					disableRipple={disabled || !onClick}
					onClick={(e) => {
						if (onClick) onClick(e);
						if (isCollapsible) setCollapsed((collapsed) => !collapsed);
						if (popup) setPopupOpen(true);
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
						endIcon ? (
							endIcon
						) : isCollapsible ? (
							collapsed ? (
								<KeyboardArrowUp />
							) : (
								<KeyboardArrowDown />
							)
						) : popup ? (
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
						<Stack justifyContent={"flex-start"} gap={0.5} sx={{ textTransform: "none" }}>
							<Typography fontWeight={500} noWrap={!wrap}>
								{title}
							</Typography>
							<Stack direction={"row"} alignItems={"center"} gap={1}>
								{isPremium && license === "free" && <Chip size={"small"} label={"PRO"} />}
								{typeof subtitle === "string" ? (
									<Typography variant={"body2"} color={"text.secondary"}>
										{subtitle}
									</Typography>
								) : subtitle ? (
									subtitle
								) : null}
							</Stack>
						</Stack>
					</Stack>
				</Button>
				<Collapse in={!collapsed}>{children}</Collapse>
			</>
		) : null;
	}
);

export default SettingsCard;

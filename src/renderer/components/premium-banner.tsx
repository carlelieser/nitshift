import React, { useEffect, useRef, useState } from "react";
import {
	Alert,
	alpha,
	Avatar,
	Box,
	Button,
	CircularProgress,
	Collapse,
	Grid,
	IconButton,
	Paper,
	Slide,
	Snackbar,
	Stack,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import {
	ArrowDropDown,
	ArrowDropUp,
	AutoAwesome,
	DonutSmall,
	Key,
	Monitor,
	Schedule,
	ShoppingCartCheckout,
	WbSunny,
} from "@mui/icons-material";
import { teal, yellow } from "@mui/material/colors";
import { useAppSelector } from "../hooks";
import { ipcRenderer, shell } from "electron";
import { isDev } from "../../common/utils";
import { stripe } from "../../main/stripe";
import { loadUserId } from "../../common/storage";
import PriceMenu, { descriptions, prices } from "./price-menu";

const { default: premiumBannerBg } = require("../../assets/img/premium-banner-bg.png");

const content = [
	{
		icon: Monitor,
		title: "Unlimited",
		subtitle: "No limit on the amount of monitors you can adjust",
	},
	{
		icon: WbSunny,
		title: "Global Brightness",
		subtitle: "Use one slider to control all your displays",
	},
	{
		icon: DonutSmall,
		title: "Shade Mode",
		subtitle: "Old monitor or connected through an adapter? No problem",
	},
	{
		icon: Schedule,
		title: "Schedule",
		subtitle: "Automatically adjust the brightness at the time that's right for you",
	},
];

const PremiumBanner = () => {
	const [open, setOpen] = useState<boolean>(false);
	const license = useAppSelector((state) => state.app.license);
	const theme = useTheme();

	const [loading, setLoading] = useState<boolean>(false);
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

	const [selectedPrice, setSelectedPrice] = useState<string>(prices[2]);
	const [priceDescription, setPriceDescription] = useState<string>(descriptions[selectedPrice]);
	const [priceMenuOpen, setPriceMenuOpen] = useState<boolean>(false);

	const buttonRef = useRef<HTMLDivElement>();

	const openPriceMenu = () => setPriceMenuOpen(true);
	const closePriceMenu = () => setPriceMenuOpen(false);

	const openSnackbar = () => setSnackbarOpen(true);
	const closeSnackbar = () => setSnackbarOpen(false);

	const toggleOpen = () => setOpen((prevOpen) => !prevOpen);

	const handleCheckout = async () => {
		setLoading(true);
		const price = await stripe.prices.create({
			unit_amount: Number(selectedPrice.split(".").join("")),
			currency: "usd",
			product: isDev ? "prod_O5VYb8dj5QEBLS" : "prod_O5rz0UUXuzEWpI",
		});
		const link = await stripe.paymentLinks.create({
			metadata: {
				id: loadUserId(),
			},
			line_items: [
				{
					price: price.id,
					quantity: 1,
				},
			],
			customer_creation: "always",
		});
		await ipcRenderer.invoke("disable-auto-hide");
		await shell.openExternal(link.url);
		setLoading(false);
		openSnackbar();
	};

	const handleButtonClick = async () => {
		if (open) openPriceMenu();
		else setOpen(true);
	};

	const handlePriceChange = (price: string, description: string) => {
		setSelectedPrice(price);
		setPriceDescription(description);
	};

	useEffect(() => {
		if (!snackbarOpen) {
			ipcRenderer.invoke("enable-auto-hide");
		}
	}, [snackbarOpen]);

	return license !== "premium" ? (
		<Box pt={1}>
			<Snackbar open={snackbarOpen} onClose={closeSnackbar} autoHideDuration={null}>
				<Alert severity={"info"} onClose={closeSnackbar} sx={{ width: "100%" }} elevation={8}>
					<span>Once you've made your purchase, zip on back to the app and click on the</span>{" "}
					<span style={{ marginLeft: 2, marginRight: 2 }}>
						<Key sx={{ width: 14, height: 14 }} />
					</span>{" "}
					<span>icon to activate your license.</span>
				</Alert>
			</Snackbar>
			<Paper
				component={"div"}
				sx={{
					borderRadius: 4,
					overflow: "hidden",
					position: "relative",
					backdropFilter: "blur(0)",
				}}
			>
				<Box
					sx={{
						backgroundImage: `url(${premiumBannerBg})`,
						backgroundPosition: "center",
						backgroundSize: "cover",
					}}
				>
					<Stack
						spacing={0}
						p={2}
						sx={{
							background: open
								? "linear-gradient(45deg, rgba(32, 97, 85, 0.8), rgba(129, 45, 203, 0.8))"
								: "linear-gradient(45deg, rgba(32, 97, 85, 0.8), rgba(129, 45, 203, 0.4))",
							borderTopLeftRadius: 16,
							borderTopRightRadius: 16,
							transition: theme.transitions.create(["background", "backdrop-filter"]),
						}}
						onClick={toggleOpen}
					>
						<Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} mb={1}>
							<Typography variant={"h4"} fontWeight={"bold"}>
								Go <span style={{ color: yellow[800] }}>premium</span>
							</Typography>
							{open ? <ArrowDropUp /> : <ArrowDropDown />}
						</Stack>
						<Collapse in={open}>
							<Grid container={true} spacing={1} pt={2}>
								{content.map((feature) => {
									const Icon = feature.icon;
									return (
										<Grid item={true} xs={12} key={feature.title}>
											<Paper
												sx={{
													p: 2,
													borderRadius: 4,
													bgcolor: alpha(theme.palette.background.paper, 0.4),
													backdropFilter: "blur(20px)",
													position: "relative",
												}}
												variant={"outlined"}
											>
												<Stack spacing={1}>
													<Stack direction={"row"} spacing={1} alignItems={"center"}>
														<Avatar
															sx={{
																bgcolor: alpha(yellow[900], 0.2),
																color: yellow[500],
																backdropFilter: "blur(5px)",
															}}
														>
															<Icon />
														</Avatar>
														<Typography variant={"h6"} fontWeight={500} lineHeight={1}>
															{feature.title}
														</Typography>
													</Stack>
													<Typography fontSize={14} width={"100%"} sx={{ opacity: 0.8 }}>
														{feature.subtitle}
													</Typography>
												</Stack>
											</Paper>
										</Grid>
									);
								})}
							</Grid>
						</Collapse>
					</Stack>
					<Stack
						direction={"row"}
						alignItems={"center"}
						spacing={1}
						sx={{
							bgcolor: alpha(teal[500], 0.5),
							backdropFilter: "blur(10px)",
						}}
					>
						<Tooltip title={open ? <Typography>Select a fair price</Typography> : null}>
							<Button
								ref={buttonRef}
								variant={"contained"}
								fullWidth={true}
								component={Paper}
								elevation={8}
								sx={{
									borderRadius: 4,
									borderTopLeftRadius: 0,
									borderTopRightRadius: 0,
								}}
								startIcon={open ? <AutoAwesome opacity={0.7} /> : null}
								endIcon={open ? priceMenuOpen ? <ArrowDropUp /> : <ArrowDropDown /> : null}
								onClick={handleButtonClick}
							>
								<Stack spacing={-0.5}>
									<Typography variant={"button"} sx={{ width: 150 }} textAlign={open ? "left" : "center"}>
										{open ? `$${selectedPrice}` : "View features"}
									</Typography>
									{open ? (
										<Typography
											fontSize={12}
											sx={{
												opacity: 0.8,
												textTransform: "none",
											}}
										>
											{priceDescription}
										</Typography>
									) : null}
								</Stack>
							</Button>
						</Tooltip>
						<PriceMenu
							open={priceMenuOpen}
							price={selectedPrice}
							description={priceDescription}
							anchorEl={buttonRef.current}
							onClose={closePriceMenu}
							onChange={handlePriceChange}
						/>
						<Slide direction={"left"} in={open} mountOnEnter={true} unmountOnExit={true}>
							<Box pr={1}>
								<Tooltip title={<Typography>Check out</Typography>}>
									<IconButton onClick={handleCheckout}>
										{loading ? <CircularProgress size={24} /> : <ShoppingCartCheckout />}
									</IconButton>
								</Tooltip>
							</Box>
						</Slide>
					</Stack>
				</Box>
			</Paper>
		</Box>
	) : null;
};

export default PremiumBanner;

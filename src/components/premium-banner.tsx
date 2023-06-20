import React, { useRef, useState } from "react";
import {
	Alert,
	alpha,
	Avatar,
	Box,
	Button,
	CircularProgress,
	Collapse,
	IconButton,
	Paper,
	Slide,
	Snackbar,
	Stack,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import { ArrowDropDown, ArrowDropUp, AutoAwesome, DonutSmall, Key, Monitor, ShoppingCartCheckout, WbSunny } from "@mui/icons-material";
import { teal, yellow } from "@mui/material/colors";
import { useAppSelector } from "../hooks";
import { shell } from "electron";
import { isDev } from "../utils";
import { stripe } from "../stripe";
import { loadUserId } from "../storage";
import PriceMenu, { descriptions, prices } from "./price-menu";

const { default: premiumBannerBg } = require("../assets/img/premium-banner-bg.png");

const content = [
	{
		icon: Monitor,
		title: "Unlimited Monitors",
		subtitle: "No cap on the amount of monitors you can adjust",
	},
	{
		icon: WbSunny,
		title: "Global Brightness",
		subtitle: "Control brightness on all screens in one move",
	},
	{
		icon: DonutSmall,
		title: "Shade Mode",
		subtitle: "Adjust brightness even on old or hub-connected monitors",
	},
];

const PremiumBanner = () => {
	const [open, setOpen] = useState<boolean>(false);
	const license = useAppSelector((state) => state.app.license);
	const theme = useTheme();

	const [loading, setLoading] = useState<boolean>(false);
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

	const [selectedPrice, setSelectedPrice] = useState<string>(prices[4]);
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
		await shell.openExternal(link.url);
		setLoading(false);
		setSnackbarOpen(true);
	};

	const handleButtonClick = async () => {
		if (open) openPriceMenu();
		else setOpen(true);
	};

	const handlePriceChange = (price: string, description: string) => {
		setSelectedPrice(price);
		setPriceDescription(description);
	};

	return license !== "premium" ? (
		<>
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
				sx={{
					backgroundImage: `url(${premiumBannerBg})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					borderRadius: 4,
					overflow: "hidden",
				}}
			>
				<>
					<Stack
						spacing={0}
						p={2}
						sx={{
							background: open
								? "linear-gradient(45deg, rgba(32, 97, 85, 0.8), rgba(129, 45, 203, 0.8))"
								: "linear-gradient(45deg, rgba(32, 97, 85, 0.8), rgba(129, 45, 203, 0.4))",
							backdropFilter: open ? "blur(10px)" : "blur(0)",
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
							<Stack spacing={1}>
								{content.map((feature) => {
									const Icon = feature.icon;
									return (
										<Stack direction={"row"} spacing={2} key={feature.title}>
											<Avatar
												sx={{
													bgcolor: alpha(yellow[900], 0.2),
													color: yellow[500],
													backdropFilter: "blur(5px)",
												}}
											>
												<Icon />
											</Avatar>
											<Stack>
												<Typography variant={"h6"} fontWeight={"bold"}>
													{feature.title}
												</Typography>
												<Typography sx={{ opacity: 0.9 }} fontSize={14}>
													{feature.subtitle}
												</Typography>
											</Stack>
										</Stack>
									);
								})}
							</Stack>
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
				</>
			</Paper>
		</>
	) : null;
};

export default PremiumBanner;

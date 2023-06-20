import React, { KeyboardEventHandler, useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	CircularProgress,
	Collapse,
	IconButton,
	InputAdornment,
	Paper,
	Portal,
	Snackbar,
	Stack,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import { Check, Email, Key, Send } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { randomUUID } from "crypto";
import { clone, times } from "lodash";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setTrialAvailability, setLicense, setReceivedPremium } from "../../reducers/app";
import { stripe } from "../../stripe";
import Dialog, { DialogComponentProps } from "../dialog";

const { default: template } = require("../../templates/email-verification.html");
const { default: vaultBg } = require("../../assets/img/vault.png");

const { clipboard } = require("electron");
const nodemailer = require("nodemailer");

const transportConfig = {
	host: "smtp.gmail.com",
	port: 587,
	auth: {
		user: "support@glimmr.app",
		pass: "V1#z&&F42rOWFLau",
	},
};

const ActivationDialog: React.FC<DialogComponentProps> = ({ open, onClose }) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const isCompact = useAppSelector((state) => state.app.mode === "compact");

	const [email, setEmail] = useState<string>("");

	const [loading, setLoading] = useState<boolean>(false);
	const [emailSent, setEmailSent] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [codeChars, setCodeChars] = useState<Array<string>>(times(6, () => ""));
	const [codeCharIndex, setCodeCharIndex] = useState<number>(0);
	const [codeVerified, setCodeVerified] = useState<boolean>(false);
	const [licenseVerified, setLicenseVerified] = useState<boolean>(false);

	const [ctrlPressed, setCtrlPressed] = useState<boolean>(false);

	const code = useRef<string>("");

	const updateCode = () => {
		const id = randomUUID().split("-").join("");
		code.current = id.substring(0, 6).toUpperCase();
	};

	const getEmailConfig = () => ({
		from: "Glimmr <support@glimmr.app>",
		to: email,
		subject: "Your single-use code",
		html: template.replace("[CODE]", code.current),
	});

	const attemptToSendVerificationEmail = async () => {
		updateCode();
		try {
			let transporter = nodemailer.createTransport(transportConfig);
			await transporter.sendMail(getEmailConfig());
			setEmailSent(true);
		} catch (err) {
			if (err) setError("Error sending email. Please try again.");
		}
	};

	const sendVerificationEmail = async () => {
		setLoading(true);
		await attemptToSendVerificationEmail();
		setLoading(false);
	};

	const verifyCode = () => {
		setLoading(true);
		const attempt = codeChars.join("");
		const verified = code.current === attempt;
		if (!attempt || !verified) {
			setLoading(false);
			return setError("Wrong verification code");
		}
		setCodeVerified(verified);
	};

	const handleEmailChange = (e: any) => setEmail(e.target.value);

	const handleEmailKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.keyCode === 13) sendVerificationEmail();
	};

	const clearError = () => setError("");

	const goToNextChar = () => {
		setCodeCharIndex((prevIndex) => {
			const next = prevIndex + 1;
			const last = codeChars.length - 1;
			if (next > last) return last;
			return prevIndex + 1;
		});
	};

	const goToPrevChar = () => {
		setCodeCharIndex((prevIndex) => {
			const prev = prevIndex - 1;
			if (prev <= 0) return 0;
			return prev;
		});
	};

	const verifyLicense = async () => {
		try {
			const customerResponse = await stripe.customers.list({
				email,
				limit: 1,
			});
			const customer = customerResponse.data[0];
			const paymentIntentResponse = await stripe.paymentIntents.list({
				customer: customer.id,
			});
			const paymentIntent = paymentIntentResponse.data[0];
			setLicenseVerified(paymentIntent.status === "succeeded");
		} catch (err) {
			if (err) setError("Error verifying license. Please try again.");
		}
	};

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (emailSent) {
				if (e.key === "v") return setCodeChars(clipboard.readText().split(""));
				if (e.key.length === 1 && e.key.match(/\w/g)) {
					setCodeChars((prevPinChars) => {
						prevPinChars[codeCharIndex] = e.key.toUpperCase();
						return clone(prevPinChars);
					});
					goToNextChar();
				}
				console.log(e.key);
				if (e.key === "Backspace") {
					setCodeChars((prevPinChars) => {
						prevPinChars[codeCharIndex] = "";
						return clone(prevPinChars);
					});
					goToPrevChar();
				}
				if (e.key === "ArrowLeft") goToPrevChar();
				if (e.key === "ArrowRight") goToNextChar();
				if (e.key === "Control") setCtrlPressed(true);
			}
		},
		[emailSent, codeChars, codeCharIndex, ctrlPressed]
	);

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.key === "Control") {
			setCtrlPressed(false);
		}
		if (e.keyCode === 13) {
			if (emailSent) {
				verifyCode();
			}
		}
	};

	const handleReset = () => {
		clearError();
		setEmail("");
		setLoading(false);
		setCodeChars(times(6, () => ""));
		setCodeCharIndex(0);
		setEmailSent(false);
		setCtrlPressed(false);
		setCodeVerified(false);
		setLicenseVerified(false);
		code.current = "";
	};

	useEffect(() => {
		if (licenseVerified) {
			dispatch(setReceivedPremium(true));
			dispatch(setLicense("premium"));
			dispatch(setTrialAvailability(false));
			onClose();
		}
	}, [licenseVerified]);

	useEffect(() => {
		if (codeVerified) verifyLicense();
	}, [codeVerified]);

	useEffect(() => {
		if (codeChars.every((char) => char !== "")) verifyCode();
	}, [codeChars]);

	useEffect(() => {
		clearError();
	}, [email, codeChars]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	return (
		<Dialog open={open} title={"Activate"} onClose={onClose} onReset={handleReset}>
			<Stack height={"100%"} alignItems={"center"} justifyContent={"center"}>
				<Collapse in={emailSent}>
					<Stack alignItems={"center"} justifyContent={"center"} spacing={2}>
						<Stack
							spacing={2}
							direction={isCompact ? "row" : "column"}
							alignItems={"center"}
							justifyContent={"center"}
							width={isCompact ? 400 : "auto"}
						>
							<Stack
								width={48}
								minWidth={48}
								height={48}
								minHeight={48}
								alignItems={"center"}
								justifyContent={"center"}
								sx={{ bgcolor: "primary.main", borderRadius: "100%" }}
							>
								<Key />
							</Stack>
							<Typography
								textAlign={"center"}
								fontSize={16}
								px={isCompact ? 0 : 4}
								sx={{ opacity: 0.7 }}
								height={isCompact ? 50 : "auto"}
							>
								We have sent a verification code to {email}
							</Typography>
						</Stack>
						<Stack direction={isCompact ? "row" : "column"} alignItems={"center"} justifyContent={"center"} spacing={2}>
							<Stack direction={"row"} height={50} spacing={1}>
								{codeChars.map((value, index) => (
									<Paper
										key={`code-${index}`}
										variant={"outlined"}
										sx={{
											p: 1,
											width: 50,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											borderColor: index === codeCharIndex ? "primary.main" : "",
											transition: theme.transitions.create(["border-color"]),
										}}
										onClick={() => setCodeCharIndex(index)}
									>
										<Typography fontSize={"2rem"}>{value}</Typography>
									</Paper>
								))}
							</Stack>
							{isCompact ? (
								<Tooltip title={<Typography>Verify</Typography>}>
									<IconButton onClick={verifyCode}>{loading ? <CircularProgress size={24} /> : <Check />}</IconButton>
								</Tooltip>
							) : (
								<LoadingButton loading={loading} startIcon={<Check />} onClick={verifyCode}>
									Verify
								</LoadingButton>
							)}
						</Stack>
					</Stack>
				</Collapse>
				<Collapse in={!emailSent}>
					<Stack spacing={2} direction={isCompact ? "row" : "column"} alignItems={isCompact ? "center" : "auto"}>
						<TextField
							label={"Email"}
							type={"email"}
							placeholder={"johnyappleseed@gmail.com"}
							sx={{
								minWidth: 300,
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position={"start"}>
										<Email />
									</InputAdornment>
								),
								endAdornment: isCompact ? (
									<InputAdornment position={"end"}>
										<Tooltip title={<Typography>Send verification email</Typography>}>
											<IconButton onClick={sendVerificationEmail}>
												{loading ? <CircularProgress size={24} /> : <Send />}
											</IconButton>
										</Tooltip>
									</InputAdornment>
								) : null,
							}}
							onKeyUp={handleEmailKeyUp}
							value={email}
							onChange={handleEmailChange}
							helperText={"Use the same email you used when purchasing the license."}
						/>
						<Stack justifyContent={"center"}>
							{isCompact ? null : (
								<LoadingButton loading={loading} startIcon={<Send />} onClick={sendVerificationEmail}>
									Send verification email
								</LoadingButton>
							)}
						</Stack>
					</Stack>
				</Collapse>
				<Portal>
					<Snackbar open={!!error} autoHideDuration={4000} onClose={clearError}>
						<Alert onClose={clearError} severity={"error"} sx={{ width: "100%" }}>
							{error}
						</Alert>
					</Snackbar>
				</Portal>
			</Stack>
		</Dialog>
	);
};

export default ActivationDialog;

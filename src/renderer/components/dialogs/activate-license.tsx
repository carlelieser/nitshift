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
	useTheme
} from "@mui/material";
import { Check, Key, LockOpen, Mail, Refresh, Send } from "mui-symbols";
import LoadingButton from "@mui/lab/LoadingButton";
import { clone, times } from "lodash";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setReceivedPremium } from "@reducers/app";
import Dialog, { DialogComponentProps } from "../dialog";

import { clipboard, ipcRenderer } from "electron";
import { request } from "@common/fetch";

const ActivateLicenseDialog: React.FC<DialogComponentProps> = ({ open, onClose }) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const isCompact = useAppSelector((state) => state.app.mode === "compact");
	const userId = useAppSelector((state) => state.app.userId);

	const [email, setEmail] = useState<string>("");

	const [loading, setLoading] = useState<boolean>(false);
	const [emailSent, setEmailSent] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [codeChars, setCodeChars] = useState<Array<string>>(times(6, () => ""));
	const [codeCharIndex, setCodeCharIndex] = useState<number>(0);
	const [codeVerified, setCodeVerified] = useState<boolean>(false);
	const [licenseVerified, setLicenseVerified] = useState<boolean>(false);
	const [licenseKey, setLicenseKey] = useState<string>("");

	const [ctrlPressed, setCtrlPressed] = useState<boolean>(false);

	const code = useRef<string>("");

	const sendEmailVerification = async () => {
		const response = await request(`/api/verify?email=${email}`, {}, userId);
		if (!response.ok) return setError("Error sending email. Please try again.");
		setEmailSent(true);
	};

	const sendVerificationEmail = async () => {
		setLoading(true);
		await sendEmailVerification();
		setLoading(false);
	};

	const verifyCode = async () => {
		setLoading(true);
		const attempt = codeChars.join("");
		const response = await request(`/api/verify?email=${email}&code=${attempt}`, {}, userId);
		setLoading(false);

		if (!response.ok) {
			return setError("Wrong verification code");
		}

		setCodeVerified(response.ok);
	};

	const handleEmailChange = (e: any) => setEmail(e.target.value);

	const handleEmailKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.keyCode === 13) sendVerificationEmail();
	};

	const handleLicenseChange = (e: any) => setLicenseKey(e.target.value);

	const handleLicenseKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.keyCode === 13) verifyLicense();
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
		const response = await request(`/api/v2/verify/license?email=${email}&code=${licenseKey}`, {}, userId);
		const verified = response.ok;

		if (verified) {
			setLicenseVerified(true);
		} else {
			const data = await response.json();
			setError(data?.message ?? response.statusText ?? "Error verifying license. Please try again.");
		}

		setLoading(false);
	};

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (emailSent && !codeVerified) {
				if (e.key === "v" && ctrlPressed) return setCodeChars(clipboard.readText().split(""));
				if (e.key.length === 1 && e.key.match(/\w/g)) {
					setCodeChars((prevPinChars) => {
						prevPinChars[codeCharIndex] = e.key.toUpperCase();
						return clone(prevPinChars);
					});
					goToNextChar();
				}
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
		[emailSent, codeChars, codeCharIndex, ctrlPressed, codeVerified]
	);

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
			ipcRenderer.invoke("store-user");
			onClose();
		}
	}, [licenseVerified]);

	useEffect(() => {
		if (codeChars.every((char) => char !== "")) verifyCode();
	}, [codeChars]);

	useEffect(() => {
		if (licenseKey.length === 36) verifyLicense();
	}, [licenseKey]);

	useEffect(() => {
		clearError();
	}, [email, codeChars]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	useEffect(() => {
		if (open) ipcRenderer.invoke("app/auto-hide/disable");
		else ipcRenderer.invoke("app/auto-hide/enable");
	}, [open]);

	return (
		<Dialog open={open} icon={<Key />} title={"Activate License"} onClose={onClose} onExited={handleReset}>
			<Stack height={"100%"} alignItems={"center"} justifyContent={"center"}>
				<Collapse in={emailSent && codeVerified}>
					<Stack
						spacing={2}
						direction={isCompact ? "row" : "column"}
						alignItems={isCompact ? "center" : "auto"}
					>
						<TextField
							label={"License"}
							type={"text"}
							placeholder={"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"}
							sx={{
								minWidth: 300
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position={"start"}>
										<Key />
									</InputAdornment>
								)
							}}
							onKeyUp={handleLicenseKeyUp}
							value={licenseKey}
							onChange={handleLicenseChange}
						/>
						<Stack justifyContent={"center"}>
							{isCompact ? null : (
								<LoadingButton loading={loading} startIcon={<LockOpen />} onClick={verifyLicense}>
									Activate License
								</LoadingButton>
							)}
						</Stack>
					</Stack>
				</Collapse>
				<Collapse in={emailSent && !codeVerified}>
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
								sx={{ bgcolor: "primary.main", color: "primary.contrastText", borderRadius: "100%" }}
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
						<Stack
							direction={isCompact ? "row" : "column"}
							alignItems={"center"}
							justifyContent={"center"}
							spacing={2}
						>
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
											transition: theme.transitions.create(["border-color"])
										}}
										onClick={() => setCodeCharIndex(index)}
									>
										<Typography fontSize={"2rem"}>{value}</Typography>
									</Paper>
								))}
							</Stack>
							<Stack direction={"row"} alignItems={"center"} spacing={1}>
								{isCompact ? (
									<Tooltip title={<Typography>Resend</Typography>}>
										<IconButton onClick={sendVerificationEmail}>
											{loading ? <CircularProgress size={24} /> : <Refresh />}
										</IconButton>
									</Tooltip>
								) : (
									<LoadingButton
										loading={loading}
										startIcon={<Refresh />}
										color={"secondary"}
										onClick={sendVerificationEmail}
									>
										Retry
									</LoadingButton>
								)}
								{isCompact ? (
									<Tooltip title={<Typography>Verify</Typography>}>
										<IconButton onClick={verifyCode}>
											{loading ? <CircularProgress size={24} /> : <Check />}
										</IconButton>
									</Tooltip>
								) : (
									<LoadingButton loading={loading} startIcon={<Check />} onClick={verifyCode}>
										Verify
									</LoadingButton>
								)}
							</Stack>
						</Stack>
					</Stack>
				</Collapse>
				<Collapse in={!emailSent}>
					<Stack
						spacing={2}
						direction={isCompact ? "row" : "column"}
						alignItems={isCompact ? "center" : "auto"}
					>
						<TextField
							label={"Email"}
							type={"email"}
							placeholder={"johnyappleseed@gmail.com"}
							sx={{
								minWidth: 300
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position={"start"}>
										<Mail />
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
								) : null
							}}
							onKeyUp={handleEmailKeyUp}
							value={email}
							onChange={handleEmailChange}
							helperText={"This is the email you used when purchasing your license."}
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

export default ActivateLicenseDialog;

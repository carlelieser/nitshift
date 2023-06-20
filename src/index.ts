import {
	app,
	BrowserWindow,
	Tray,
	screen,
	ipcMain,
	Menu,
	OnHeadersReceivedListenerDetails,
	HeadersReceivedResponse,
	session,
} from "electron";
import {
	loadMonitors,
	loadLicense,
	loadUserEmail,
	loadUserId,
	loadGlobalBrightness,
	loadTrialStartDate,
	loadTrialAvailability,
	saveLicense,
	saveTrialStartDate,
	saveTrialAvailability,
	saveUserEmail,
	saveUserId,
	loadSchedule,
	saveMonitors,
} from "./storage";
import { clone, difference, reduce, throttle } from "lodash";
import { isDev, normalizeBrightness } from "./utils";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { machineIdSync } from "node-machine-id";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { dayjs, getDateFromTime } from "./dayjs";

import lumi from "lumi-control";
import MainWindow from "./main-window";
import ShadeManager from "./shade-manager";
import encryption from "./encryption.json";

import "./firebase";

import * as path from "path";
import * as process from "process";

const TRIAL_JOB_TIME = isDev ? "* * * * * *" : "0 * * * * *";
const TRIAL_DURATION = isDev ? 1000 * 60 : 1000 * 60 * 60 * 24 * 7;

const CronJob = require("cron").CronJob;
const Store = require("electron-store");

if (require("electron-squirrel-startup")) app.quit();

Store.initRenderer();

const { default: iconPath } = require("./assets/img/icon.ico");

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

const schedule: Array<typeof CronJob> = [];

let window = new MainWindow(MAIN_WINDOW_WEBPACK_ENTRY);
let shades = new ShadeManager();
let tray: Tray = null;

const handleTrayClick = () => {
	if (window.data) window.data.show();
	else window.create();
};

const createTrayIcon = () => {
	tray = new Tray(isDev ? path.resolve(".webpack", "main", iconPath) : path.resolve(__dirname, iconPath));
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Quit",
			click: () => {
				tray.destroy();
				app.quit();
				process.exit();
			},
		},
	]);
	tray.setToolTip("Blinder");
	tray.setContextMenu(contextMenu);
	tray.on("click", handleTrayClick);
};

const updateMonitorsAndAdjustWindowPosition = () => {
	window.refreshMonitors();
	window.readjust();
};

const applyBrightness = throttle(() => {
	const monitors = loadMonitors().filter(({ disabled }) => !disabled);
	const brightness = loadGlobalBrightness();
	const nativeMonitors = monitors.filter(({ mode }) => mode === "native");
	const shadeMonitors = monitors.filter(({ mode }) => mode === "shade");

	if (nativeMonitors.length) {
		nativeMonitors.forEach((monitor) => shades.destroyShade(monitor.id));
		lumi.set(
			reduce(
				nativeMonitors,
				(prevMonitors, monitor) => ({
					...prevMonitors,
					[monitor.id]: normalizeBrightness(monitor.brightness, brightness),
				}),
				{}
			)
		);
	}
	if (shadeMonitors.length) {
		shadeMonitors.forEach((monitor) => {
			lumi.set(monitor.id, 100);
			shades.update(monitor.id, normalizeBrightness(monitor.brightness, brightness));
		});
	}
}, 200);

const getIdAndEmail = () => {
	const id = machineIdSync();
	return [id, `${id}@glimmr.com`];
};

const createNewUser = async () => {
	const auth = getAuth();
	const [id, email] = getIdAndEmail();
	saveUserId(id);
	saveUserEmail(email);
	return createUserWithEmailAndPassword(auth, email, encryption.id).then(updateUserDoc).catch(updateStorageWithUserDoc);
};

const updateUserDoc = async () => {
	const auth = getAuth();
	const id = loadUserId();
	const email = loadUserEmail();
	await signInWithEmailAndPassword(auth, email, encryption.id);
	const license = loadLicense();
	const trialStartDate = loadTrialStartDate();
	const trialAvailability = loadTrialAvailability();
	await setDoc(
		doc(db, "users", email),
		{
			id,
			email,
			license,
			trialStartDate,
			trialAvailability,
		},
		{ merge: true }
	);
};

const updateStorageWithUserDoc = async () => {
	const auth = getAuth();
	const email = loadUserEmail();
	await signInWithEmailAndPassword(auth, email, encryption.id);
	const docRef = doc(db, "users", email);
	const docSnap = await getDoc(docRef);
	if (docSnap.exists()) {
		const user = docSnap.data();
		saveLicense(user.license);
		saveTrialStartDate(user.trialStartDate);
		saveTrialAvailability(user.trialAvailability);
		if (user.trialStartDate) {
			if (Date.now() - user.trialStartDate >= TRIAL_DURATION) {
				startTrialCheck();
				await updateUserDoc();
			}
		}
		window.data?.webContents.send("sync-license");
	} else {
		await updateUserDoc();
	}
};

const startTrialCheck = () => {
	const job = new CronJob(
		TRIAL_JOB_TIME,
		() => {
			const trial = loadTrialStartDate();
			if (trial) {
				if (Date.now() - trial >= TRIAL_DURATION) {
					saveLicense("free");
					saveTrialStartDate(null);
					saveTrialAvailability(false);
					window.refreshMonitors();
					updateUserDoc().finally(() => {
						job.stop();
						window.data?.webContents.send("trial-ended");
					});
				}
			}
		},
		null,
		true,
		"America/New_York"
	);
	job.start();
};

const applySchedule = (id: string) => {
	const schedule = loadSchedule().find((schedule) => schedule.id === id);
	if (!schedule) return;
	const referenceMonitors = loadMonitors();
	const prevMonitors = loadMonitors();
	prevMonitors.forEach(({ id }, index) => {
		if (schedule.monitors.includes(id)) {
			prevMonitors[index].brightness = schedule.brightness;
		}
	});
	const updatedMonitors = clone(prevMonitors);
	saveMonitors(updatedMonitors);
	if (difference(referenceMonitors, updatedMonitors).length) {
		applyBrightness();
		window.refreshMonitors();
	}
};

const getPrevSchedules = () => {
	return loadSchedule().filter(({ id, time }) => {
		const currentTime = dayjs();
		const targetDate = getDateFromTime(time);
		const targetTime = dayjs().hour(targetDate.hour()).minute(targetDate.minute());
		return currentTime.isAfter(targetTime);
	});
};

const checkSchedule = () => {
	schedule.forEach((job) => job.stop);

	const prevSchedules = getPrevSchedules();
	const latestSchedule = prevSchedules[prevSchedules.length - 1];

	if (latestSchedule) applySchedule(latestSchedule.id);

	loadSchedule().forEach(({ id, monitors, time, brightness }) => {
		const targetDate = getDateFromTime(time);
		const cronExpression = `0 ${targetDate.minute()} ${targetDate.hour()} * * *`;
		const job = new CronJob(
			cronExpression,
			() => {
				applySchedule(id);
			},
			null,
			true,
			"America/New_York"
		);
		job.start();
		schedule.push(job);
	});
};

const handleFreeTrialStarted = async () => {
	await updateUserDoc();
	startTrialCheck();
};

const initAuth = async () => {
	const user = loadUserId();
	const license = loadLicense();
	if (license === "trial") startTrialCheck();
	if (user) await updateStorageWithUserDoc();
	else await createNewUser();
};

app.on("ready", async () => {
	await initAuth();
	checkSchedule();

	window.create();
	window.refreshMonitors();

	createTrayIcon();
	applyBrightness();

	window.data.on("show", updateStorageWithUserDoc);

	screen.on("display-metrics-changed", updateMonitorsAndAdjustWindowPosition);
	screen.on("display-added", updateMonitorsAndAdjustWindowPosition);
	screen.on("display-removed", updateMonitorsAndAdjustWindowPosition);
	session.defaultSession.webRequest.onHeadersReceived(
		(details: OnHeadersReceivedListenerDetails, callback: (headersReceivedResponse: HeadersReceivedResponse) => void) => {
			callback({
				responseHeaders: {
					...details.responseHeaders,
					"Content-Security-Policy": ["connect-src 'self' * 'unsafe-eval'"],
				},
			});
		}
	);
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) window.create();
});

app.on("render-process-gone", () => {
	window.create();
	window.data.show();
});

ipcMain.handle("free-trial-started", handleFreeTrialStarted);
ipcMain.handle("sync-user", updateUserDoc);

ipcMain.handle("monitor-brightness-changed", applyBrightness);
ipcMain.handle("monitor-mode-changed", applyBrightness);
ipcMain.handle("monitor-availability-changed", applyBrightness);
ipcMain.handle("monitors-refreshed", applyBrightness);

ipcMain.handle("global-brightness-changed", applyBrightness);
ipcMain.handle("mode-changed", window.applyMode);

ipcMain.handle("enable-pass-through", window.enablePassThrough);
ipcMain.handle("disable-pass-through", window.disablePassThrough);

ipcMain.handle("schedule-modified", checkSchedule);

ipcMain.handle("minimize", () => window.data.minimize());

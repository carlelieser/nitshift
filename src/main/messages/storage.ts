// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import * as storage from "@main/storage";
import { ipcMain } from "electron";

ipcMain.on("storage/remove", (e, key) => {
	storage.storage().delete(key as never);
	e.returnValue = true;
});

ipcMain.on("storage/load-active-monitor", (e) => {
	e.returnValue = storage.loadActiveMonitor();
});
ipcMain.on("storage/load-appearance", (e) => {
	e.returnValue = storage.loadAppearance();
});
ipcMain.on("storage/load-auto-resize", (e) => {
	e.returnValue = storage.loadAutoResize();
});
ipcMain.on("storage/load-sync-appearance", (e) => {
	e.returnValue = storage.loadSyncAppearance();
});
ipcMain.on("storage/load-auto-update-check", (e) => {
	e.returnValue = storage.loadAutoUpdateCheck();
});
ipcMain.on("storage/load-brightness-modes", (e) => {
	e.returnValue = storage.loadBrightnessModes();
});
ipcMain.on("storage/load-global-brightness", (e) => {
	e.returnValue = storage.loadGlobalBrightness();
});
ipcMain.on("storage/load-last-updated-on", (e) => {
	e.returnValue = storage.loadLastUpdatedOn();
});
ipcMain.on("storage/load-license", (e) => {
	e.returnValue = storage.loadLicense();
});
ipcMain.on("storage/load-mode", (e) => {
	e.returnValue = storage.loadMode();
});
ipcMain.on("storage/load-monitors", (e) => {
	e.returnValue = storage.loadMonitors();
});
ipcMain.on("storage/load-monitor-nicknames", (e) => {
	e.returnValue = storage.loadMonitorNicknames();
});
ipcMain.on("storage/load-native", (e) => {
	e.returnValue = storage.loadNative();
});
ipcMain.on("storage/load-schedule", (e) => {
	e.returnValue = storage.loadSchedule();
});
ipcMain.on("storage/load-startup-settings", (e) => {
	e.returnValue = storage.loadStartupSettings();
});
ipcMain.on("storage/load-trial-availability", (e) => {
	e.returnValue = storage.loadTrialAvailability();
});
ipcMain.on("storage/load-trial-start-date", (e) => {
	e.returnValue = storage.loadTrialStartDate();
});
ipcMain.on("storage/load-user-email", (e) => {
	e.returnValue = storage.loadUserEmail();
});
ipcMain.on("storage/load-user-id", (e) => {
	e.returnValue = storage.loadUserId();
});
ipcMain.on("storage/load-min-shade-level", (e) => {
	e.returnValue = storage.loadMinShadeLevel();
});
ipcMain.on("storage/load-max-shade-level", (e) => {
	e.returnValue = storage.loadMaxShadeLevel();
});
ipcMain.on("storage/save-active-monitor", (e, monitor) => {
	e.returnValue = storage.saveActiveMonitor(monitor);
});
ipcMain.on("storage/save-appearance", (e, appearance) => {
	e.returnValue = storage.saveAppearance(appearance);
});
ipcMain.on("storage/save-auto-resize", (e, autoResize) => {
	e.returnValue = storage.saveAutoResize(autoResize);
});
ipcMain.on("storage/save-sync-appearance", (e, shouldSync) => {
	e.returnValue = storage.saveSyncAppearance(shouldSync);
});
ipcMain.on("storage/save-auto-update-check", (e, autoUpdateCheck) => {
	e.returnValue = storage.saveAutoUpdateCheck(autoUpdateCheck);
});
ipcMain.on("storage/save-brightness-modes", (e, modes) => {
	e.returnValue = storage.saveBrightnessModes(modes);
});
ipcMain.on("storage/save-global-brightness", (e, brightness) => {
	e.returnValue = storage.saveGlobalBrightness(brightness);
});
ipcMain.on("storage/save-last-updated-on", (e, date) => {
	e.returnValue = storage.saveLastUpdatedOn(date);
});
ipcMain.on("storage/save-license", (e, license) => {
	e.returnValue = storage.saveLicense(license);
});
ipcMain.on("storage/save-mode", (e, mode) => {
	e.returnValue = storage.saveMode(mode);
});
ipcMain.on("storage/save-monitors", (e, monitors) => {
	e.returnValue = storage.saveMonitors(monitors);
});
ipcMain.on("storage/save-monitor-nicknames", (e, monitors) => {
	e.returnValue = storage.saveMonitorNicknames(monitors);
});
ipcMain.on("storage/save-native", (e, isNative) => {
	e.returnValue = storage.saveNative(isNative);
});
ipcMain.on("storage/save-schedule", (e, schedule) => {
	e.returnValue = storage.saveSchedule(schedule);
});
ipcMain.on("storage/save-startup-settings", (e, settings) => {
	e.returnValue = storage.saveStartupSettings(settings);
});
ipcMain.on("storage/save-trial-availability", (e, available) => {
	e.returnValue = storage.saveTrialAvailability(available);
});
ipcMain.on("storage/save-trial-start-date", (e, date) => {
	e.returnValue = storage.saveTrialStartDate(date);
});
ipcMain.on("storage/save-user-email", (e, email) => {
	e.returnValue = storage.saveUserEmail(email);
});
ipcMain.on("storage/save-user-id", (e, id) => {
	e.returnValue = storage.saveUserId(id);
});
ipcMain.on("storage/save-min-shade-level", (e, level) => {
	e.returnValue = storage.saveMinShadeLevel(level);
});
ipcMain.on("storage/save-max-shade-level", (e, level) => {
	e.returnValue = storage.saveMaxShadeLevel(level);
});

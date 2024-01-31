// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import * as storage from "@main/storage";
import { ipcMain } from "electron";

ipcMain.on("storage/remove", (e, key) => {
	storage.storage().delete(key as never);
	e.returnValue = true;
});

{{{replacement}}}
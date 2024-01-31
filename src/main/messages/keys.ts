import { ipcMain } from "electron";
import * as keys from "@main/keys";
import objectPath from "object-path";

ipcMain.on("key/path", (e, path) => {
	e.returnValue = objectPath(keys).get(path);
});

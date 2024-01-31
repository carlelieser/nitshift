import path from "node:path";
import { app } from "electron";

export const isPackaged = path.dirname(app.getPath("exe")) === path.resolve(app.getAppPath(), "..", "..");

export const exeRoot = path.dirname(app.getPath("exe"));

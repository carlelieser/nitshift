import { app } from "electron";
import Store from "electron-store";
import AppManager from "./managers/app-manager";

import AppMessages from "./messages/app";
import "./messages/stripe";
import "./messages/storage";
import "./messages/keys";
import "./mailer/mailer";

import "./firebase";

if (require("electron-squirrel-startup")) app.quit();

require("v8-compile-cache");

Store.initRenderer();

const manager = new AppManager();

AppMessages.init(manager.window);

app.on("ready", manager.init);

app.on("render-process-gone", manager.restart);

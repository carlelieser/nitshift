import { ipcMain } from "electron";
import systemInformation from "systeminformation";
import { request } from "@common/fetch";
import { storage } from "./storage";

ipcMain.handle("app/bug/report", async (_event, body) => {
	try {
		const store = storage().store;
		const machine = {
			...(await systemInformation.system()),
			...(await systemInformation.cpu()),
			...(await systemInformation.mem()),
			store
		};
		const response = await request("/api/bugs", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...body, machine })
		});
		return response.ok;
	} catch (err) {
		console.log(err);
		return false;
	}
});

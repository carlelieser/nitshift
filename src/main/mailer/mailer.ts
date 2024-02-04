import * as Mailer from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import * as nodemailer from "nodemailer";

import emailVerificationTemplate from "./templates/email-verification.html?raw";
import licenseVerifiedTemplate from "./templates/license-verified.html?raw";
import { ipcMain } from "electron";
import { storage } from "../storage";
import systemInformation from "systeminformation";
import { mail_id } from "../keys";

const config: SMTPTransport.Options = {
	host: "smtp.gmail.com",
	port: 587,
	auth: {
		user: "support@glimmr.app",
		pass: mail_id
	},
	requireTLS: true
};

const getEmailVerificationConfig = (email: string, code: string): Mailer.Options => ({
	from: "Glimmr <support@glimmr.app>",
	to: email,
	subject: "Your single-use code",
	html: emailVerificationTemplate.replace("[CODE]", code),
	headers: {
		"X-Face": "https://www.dropbox.com/s/9gbfmdypq6bzm7k/icon-email-compressed.png?dl=0",
		"X-Image-URL": "https://www.dropbox.com/s/9gbfmdypq6bzm7k/icon-email-compressed.png?dl=1"
	}
});

const getLicenseVerifiedConfig = (email: string): Mailer.Options => ({
	from: "Glimmr <support@glimmr.app>",
	to: email,
	bcc: "glimmr.app+98972a7044@invite.trustpilot.com",
	subject: "License verified",
	html: licenseVerifiedTemplate,
	headers: {
		"X-Face": "https://www.dropbox.com/s/9gbfmdypq6bzm7k/icon-email-compressed.png?dl=0",
		"X-Image-URL": "https://www.dropbox.com/s/9gbfmdypq6bzm7k/icon-email-compressed.png?dl=1"
	}
});

const getBugReportConfig = async (title: string, description: string) => {
	const machine = await systemInformation.getAllData();
	const data = {
		storage: storage().store,
		machine,
		description
	};
	const finalTitle = title ?? "Untitled";
	const subject = `[BUG REPORT] : ${finalTitle}`;
	const text = JSON.stringify(data);
	return {
		from: "Glimmr <support@glimmr.app>",
		to: "support@glimmr.app",
		subject,
		text
	};
};

ipcMain.handle("app/bug/report", async (_event, { title, description }) => {
	try {
		const transporter = nodemailer.createTransport(config);
		const options = await getBugReportConfig(title, description);
		await transporter.sendMail(options);
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
});

ipcMain.handle("mailer/send-email-verification", async (_event, { email, code }) => {
	try {
		const transporter = nodemailer.createTransport(config);
		await transporter.sendMail(getEmailVerificationConfig(email, code));
		return true;
	} catch (err) {
		return false;
	}
});

ipcMain.handle("mailer/send-email-verification-success", async (_event, { email }) => {
	try {
		let transporter = nodemailer.createTransport(config);
		await transporter.sendMail(getLicenseVerifiedConfig(email));
		return true;
	} catch (err) {
		return false;
	}
});

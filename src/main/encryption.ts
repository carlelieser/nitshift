import crypto from "node:crypto";
import { encryption } from "./keys";

const algorithm = "aes-256-cbc";

export const encrypt = (text: string) => {
	const iv = Buffer.from(crypto.randomBytes(16));
	let cipher = crypto.createCipheriv(algorithm, Buffer.from(encryption, "hex"), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString("hex") + encrypted.toString("hex");
};

export const decrypt = (text: string) => {
	let iv = Buffer.from(text.substring(0, 32), "hex");
	let encryptedText = Buffer.from(text.substring(32, text.length), "hex");
	let decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryption, "hex"), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
};

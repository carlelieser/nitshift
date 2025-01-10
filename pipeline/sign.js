const dotenv = require("dotenv");

dotenv.config();

const { exec } = require("child_process");
const ora = require("ora");
const logSymbols = require("log-symbols");
const path = require("path");
const fg = require("fast-glob");
const os = require("os");
const isWindows = os.platform() === "win32";
const scriptExtension = isWindows ? ".bat" : ".sh";
const shell = isWindows ? "powershell" : "/bin/bash";
const root = path.resolve(__dirname, "..");
const installer = path.join(root, "dist", "squirrel-windows", "glimmr-setup.exe");
const tool = path.dirname(fg.globSync(`code-sign-tool/**/CodeSignTool${scriptExtension}`, { cwd: root }).shift());
const command = `./CodeSignTool${scriptExtension} sign -username=${process.env.SSL_USER} -password=${process.env.SSL_PASS} -totp_secret=${process.env.SSL_TOTP_SECRET} -input_file_path="${installer}"`;

console.log(logSymbols.info, `Running command: ${command}`);

const spinner = ora().start("Signing installer");

const child = exec(command, { shell , cwd: tool }, (error, stdout, stderr) => {
	spinner.stop();
	if (error || !stdout.includes("Code signed successfully") || stderr) {
		console.log(logSymbols.error, "Signing failed:");
		console.log(error, stderr);
	} else console.log(logSymbols.success, "Installer signed");
});

child.stdout.on("data", (data) => {
	if (data.toString().includes("y/n")) {
		child.stdin.write("y", () => child.stdin.end());
	}
});

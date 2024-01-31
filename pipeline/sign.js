const { exec } = require("child_process");
const ora = require("ora");
const logSymbols = require("log-symbols");
const path = require("path");

const installerPath = path.join(__dirname, "..", "dist", "squirrel-windows", "glimmr-setup.exe");
const toolPath = path.join(__dirname, "..", "code-sign-tool");
const command = `./CodeSignTool.bat sign -username=devplex -password=$Olrock5567 -totp_secret=zXg0IXamGzM0gU+pZC4S78cBDAP4pbKmLQkDbm1gzEM= -input_file_path="${installerPath}"`;

console.log(logSymbols.info, `running command "${command}"`);

const spinner = ora().start("signing installer");

const child = exec(command, { shell: "powershell.exe", cwd: toolPath }, (error, stdout, stderr) => {
	spinner.stop();
	if (error) console.log(logSymbols.error, "failed to sign installer\n", error);
	else console.log(logSymbols.success, "installer signed");
});

child.stdout.on("data", (data) => {
	if (data.toString().includes("y/n")) {
		child.stdin.write("y", () => child.stdin.end());
	}
});

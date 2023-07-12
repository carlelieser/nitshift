import { exec } from "child_process";
import ora from "ora";
import logSymbols from "log-symbols";
import path from "path";

const outputDir = path.join(__dirname, "..", "out", "make", "squirrel.windows", "x64");
const installer = path.join(outputDir, "glimmr-setup.exe");
const command = `./CodeSignTool.bat sign -username=devplex -password=$Olrock5567 -totp_secret=zXg0IXamGzM0gU+pZC4S78cBDAP4pbKmLQkDbm1gzEM= -input_file_path="${installer}"`;

console.log(logSymbols.info, `running command "${command}"`);

const spinner = ora().start("signing installer");

const child = exec(command, { shell: "powershell.exe", cwd: "C:\\CodeSignTool" }, (error, stdout, stderr) => {
	spinner.stop();
	if (error) console.log(logSymbols.error, "failed to sign installer");
	else console.log(logSymbols.success, "installer signed");
});

child.stdout.on("data", (data) => {
	if (data.toString().includes("y/n")) {
		child.stdin.write("y", () => child.stdin.end());
	}
});

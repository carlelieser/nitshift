const { exec } = require("child_process");
const ora = require("ora");
const logSymbols = require("log-symbols");
const path = require("path");
const fg = require("fast-glob");

const root = path.resolve(__dirname, "..");
const installer = path.join(root, "dist", "squirrel-windows", "glimmr-setup.exe");
const tool = path.dirname(fg.globSync("code-sign-tool/**/CodeSignTool.bat", { cwd: root }).shift());
const command = `./CodeSignTool.bat sign -username=devplex -password=$Olrock5567 -totp_secret=zXg0IXamGzM0gU+pZC4S78cBDAP4pbKmLQkDbm1gzEM= -input_file_path="${installer}" -output_dir_path="${path.dirname(installer)}"`;

console.log(logSymbols.info, `Running command: ${command}`);

const spinner = ora().start("Signing installer");

const child = exec(command, { shell: "powershell.exe", cwd: tool }, (error, stdout, stderr) => {
	console.log(stdout, stderr)
	spinner.stop();
	if (error) console.log(logSymbols.error, "Signing failed\n", error);
	else console.log(logSymbols.success, "Installer signed");
});

child.stdout.on("data", (data) => {
	if (data.toString().includes("y/n")) {
		child.stdin.write("y", () => child.stdin.end());
	}
});

async function main() {
    const fs = await import("fs");
    const path = await import("path");
    const logSymbols = await import("log-symbols") as any;
    const ora = await import("ora") as any;
    const prettier = await import("prettier");
    const process = await import("process");
    const configModule = await import("./package.json");
    const config = configModule.default;

    const shouldIncrement = process.argv.includes("--increment");

    const current = config.version;
    const versionNumber = Number("0." + current.split(".").join(""));
    const target = (shouldIncrement ? versionNumber + 0.001 : versionNumber - 0.001).toFixed(3);
    const version = target.toString().split(".")[1].split("").join(".");

    config.version = version;

    const spinner = ora.default("Updating package.json").start();

    fs.writeFileSync(path.join(__dirname, "package.json"), prettier.format(JSON.stringify(config), {
        trailingComma: "none",
        quoteProps: "preserve",
        parser: "json5"
    }), {encoding: "utf-8"});

    spinner.stop();
    console.log(logSymbols.success, "Updated package.json")

    spinner.clear();
    spinner.start("Updating version.ts");

    fs.writeFileSync(path.join(__dirname, "src", "common", "version.ts"), `export const VERSION_TAG = "v${version}"`, {encoding: "utf-8"});

    spinner.stop();
    console.log(logSymbols.success, "Updated src/common/version.ts")
}

main();

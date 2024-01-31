import React from "react";
import { useAppSelector } from "../hooks";

const PassThrough = () => {
	const mode = useAppSelector((state) => state.app.mode);
	return mode === "compact" ? <div style={{ flex: 1, width: "100%" }} data-enable-pass-through={true} /> : null;
};

export default PassThrough;

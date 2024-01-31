import * as colors from "@mui/material/colors";
import objectPath from "object-path";
import { Theme } from "@mui/material";

export const getMUIColor = (theme: Theme, colorPath: string) => {
	try {
		return objectPath.get(colors, colorPath);
	} catch (err) {
		return objectPath.get(theme, colorPath);
	}
};

export const getFormattedMonitorId = (id: string) => {
	try {
		return id.split("\\")[1];
	} catch (err) {
		console.log(err);
		return id;
	}
};

export const maskStyles = {
	WebkitMaskImage:
		"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiYGBgAAgwAAAEAAGbA+oJAAAAAElFTkSuQmCC)",
};

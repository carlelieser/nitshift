import { AspectRatio } from "mui-symbols";
import SettingsCard from "../settings-card";
import { Switch } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { setAutoResize } from "@renderer/reducers/app";

const AutoResize = () => {
	const dispatch = useAppDispatch();
	const autoResize = useAppSelector((state) => state.app.autoResize);

	const toggle = () => dispatch(setAutoResize(!autoResize));

	return (
		<SettingsCard
			title={"Auto resize"}
			subtitle={"Expand to fit all available displays"}
			icon={<AspectRatio />}
			value={<Switch checked={autoResize} />}
			disableChip={true}
			onClick={toggle}
		/>
	);
};

export default AutoResize;

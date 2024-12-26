import SettingsCard from "../settings-card";
import { DesktopWindows } from "mui-symbols";
import { Switch } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setNative } from "@reducers/app";

const NativeToggle = () => {
	const dispatch = useAppDispatch();
	const isNative = useAppSelector((state) => state.app.native);

	const toggle = () => dispatch(setNative(!isNative));
	return (
		<SettingsCard
			title={"Native"}
			icon={<DesktopWindows />}
			value={<Switch checked={isNative} />}
			disableChip={true}
			onClick={toggle}
		/>
	);
};

export default NativeToggle;

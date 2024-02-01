import SettingsCard from "../settings-card";
import { Update } from "mui-symbols";
import { Switch } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setAutoUpdateCheck } from "@reducers/app";

const AutoUpdateCheck = () => {
	const dispatch = useAppDispatch();
	const autoUpdateCheck = useAppSelector((state) => state.app.autoUpdateCheck);

	const toggle = () => dispatch(setAutoUpdateCheck(!autoUpdateCheck));
	return (
		<SettingsCard
			title={"Check for Updates Automatically"}
			icon={<Update />}
			value={<Switch checked={autoUpdateCheck} />}
			disableChip={true}
			onClick={toggle}
		/>
	);
};

export default AutoUpdateCheck;

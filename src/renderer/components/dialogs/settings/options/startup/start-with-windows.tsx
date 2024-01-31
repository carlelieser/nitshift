import SettingsCard from "../../settings-card";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setStartupSettings } from "@reducers/app";
import update from "immutability-helper";
import { Radio } from "@mui/material";
import { RocketLaunchOutlined } from "mui-symbols";

const StartWithWindows = () => {
	const dispatch = useAppDispatch();
	const startup = useAppSelector((state) => state.app.startup);

	const toggle = () =>
		dispatch(
			setStartupSettings(
				update(startup, {
					auto: {
						$apply: (auto) => !auto,
					},
				})
			)
		);

	return (
		<SettingsCard
			title={"Start with Windows"}
			subtitle={"Automatically start Glimmr when you log in."}
			icon={<RocketLaunchOutlined />}
			value={<Radio checked={startup.auto} />}
			onClick={toggle}
			disableChip={true}
		/>
	);
};

export default StartWithWindows;

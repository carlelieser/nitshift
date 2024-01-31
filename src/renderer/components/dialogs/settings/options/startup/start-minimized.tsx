import SettingsCard from "../../settings-card";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setStartupSettings } from "@reducers/app";
import update from "immutability-helper";
import React from "react";
import { Radio } from "@mui/material";
import { Hide } from "mui-symbols";

const StartMinimized = () => {
	const dispatch = useAppDispatch();
	const startup = useAppSelector((state) => state.app.startup);

	const toggle = () => {
		dispatch(
			setStartupSettings(
				update(startup, {
					silent: {
						$apply: (silent) => !silent,
					},
				})
			)
		);
	};

	return (
		<SettingsCard
			title={"Start minimized"}
			subtitle={"Start Glimmr minimized to system tray."}
			icon={<Hide />}
			visible={startup.auto}
			disableChip={true}
			value={<Radio checked={startup.silent} />}
			onClick={toggle}
		/>
	);
};

export default StartMinimized;

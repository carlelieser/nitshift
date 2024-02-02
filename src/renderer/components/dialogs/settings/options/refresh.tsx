import { refreshAvailableMonitors } from "@renderer/reducers/app";
import SettingsCard from "../settings-card";
import React from "react";
import { useAppDispatch } from "@hooks";
import { Refresh as RefreshIcon } from "mui-symbols";

const Refresh = () => {
	const dispatch = useAppDispatch();
	const refreshMonitors = () => dispatch(refreshAvailableMonitors(true));

	return (
		<SettingsCard
			icon={<RefreshIcon />}
			title={"Refresh"}
			subtitle={"Update the list of detected monitors"}
			onClick={refreshMonitors}
		/>
	);
};

export default Refresh;

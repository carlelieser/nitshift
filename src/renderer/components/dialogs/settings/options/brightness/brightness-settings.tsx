import SettingsCard from "../../settings-card";
import React from "react";
import BrightnessModes from "./brightness-modes";
import { LightMode } from "mui-symbols";
import Schedule from "./schedule";
import ShadeSettings from "./shade-settings";

const BrightnessSettings = () => {
	return (
		<SettingsCard
			title={"Brightness"}
			subtitle={"Adjust global brightness settings"}
			icon={<LightMode />}
			popup={{
				title: "Brightness",
				icon: <LightMode />,
				children: (
					<>
						<BrightnessModes />
						<Schedule />
						<ShadeSettings />
					</>
				)
			}}
		/>
	);
};

export default BrightnessSettings;

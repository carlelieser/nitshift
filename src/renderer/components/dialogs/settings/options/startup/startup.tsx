import SettingsCard from "../../settings-card";
import { PowerSettingsNew } from "mui-symbols";
import Mode from "./mode";
import StartWithWindows from "./start-with-windows";
import StartMinimized from "./start-minimized";

const Startup = () => {
	return (
		<SettingsCard
			title={"Startup"}
			subtitle={"Configure launch behavior"}
			icon={<PowerSettingsNew />}
			popup={{
				title: "Startup",
				icon: <PowerSettingsNew />,
				children: (
					<>
						<Mode />
						<StartWithWindows />
						<StartMinimized />
					</>
				)
			}}
		/>
	);
};

export default Startup;

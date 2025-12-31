import React from "react";
import SettingsCard from "../../settings-card";
import ViewScheduleDialog from "@dialogs/view-schedule";
import { ChevronRight, Schedule as ScheduleIcon } from "mui-symbols";
import { useMenuState } from "@hooks";

const Schedule = () => {
	const { open, openMenu, closeMenu } = useMenuState();

	return (
		<>
			<ViewScheduleDialog open={open} onClose={closeMenu} />
			<SettingsCard
				isPremium={true}
				icon={<ScheduleIcon />}
				endIcon={<ChevronRight />}
				title={"Schedule"}
				subtitle={"Manage scheduled brightness changes"}
				onClick={openMenu}
			/>
		</>
	);
};

export default Schedule;

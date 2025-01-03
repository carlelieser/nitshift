import React, { useState } from "react";
import SettingsCard from "../../settings-card";
import ViewScheduleDialog from "@dialogs/view-schedule";
import { ChevronRight, Schedule as ScheduleIcon } from "mui-symbols";

const Schedule = () => {
	const [open, setOpen] = useState(false);

	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	return (
		<>
			<ViewScheduleDialog open={open} onClose={closeModal} />
			<SettingsCard
				isPremium={true}
				icon={<ScheduleIcon />}
				endIcon={<ChevronRight />}
				title={"Schedule"}
				subtitle={"Manage scheduled brightness changes"}
				onClick={openModal}
			/>
		</>
	);
};

export default Schedule;

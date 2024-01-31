import React, { useState } from "react";
import SettingsCard from "../settings-card";
import { useAppSelector } from "@hooks";
import ViewScheduleDialog from "../../view-schedule";
import { Schedule as ScheduleIcon } from "mui-symbols";

const Schedule = () => {
	const license = useAppSelector((state) => state.app.license);
	const [open, setOpen] = useState(false);

	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	return (
		<>
			<ViewScheduleDialog open={open} onClose={closeModal} />
			<SettingsCard
				visible={license !== "free"}
				icon={<ScheduleIcon />}
				title={"Schedule"}
				subtitle={"Set a custom brightness schedule."}
				onClick={openModal}
			/>
		</>
	);
};

export default Schedule;

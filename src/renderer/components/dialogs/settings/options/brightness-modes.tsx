import React, { useState } from "react";
import { LightMode } from "mui-symbols";
import SettingsCard from "../settings-card";
import EditBrightnessModesDialog from "../../edit-brightness-modes";

const BrightnessModes = () => {
	const [open, setOpen] = useState<boolean>(false);

	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	return (
		<>
			<EditBrightnessModesDialog open={open} onClose={closeModal} />
			<SettingsCard
				icon={<LightMode />}
				title={"Brightness Modes"}
				subtitle={"Customize existing brightness modes or add new ones"}
				onClick={openModal}
			/>
		</>
	);
};

export default BrightnessModes;

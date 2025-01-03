import React, { useState } from "react";
import { BrightnessMedium, ChevronRight } from "mui-symbols";
import SettingsCard from "../../settings-card";
import EditBrightnessModesDialog from "@dialogs/edit-brightness-modes";

const BrightnessModes = () => {
	const [open, setOpen] = useState<boolean>(false);

	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	return (
		<>
			<EditBrightnessModesDialog open={open} onClose={closeModal} />
			<SettingsCard
				icon={<BrightnessMedium />}
				endIcon={<ChevronRight />}
				title={"Profiles"}
				subtitle={"Manage brightness profiles"}
				onClick={openModal}
			/>
		</>
	);
};

export default BrightnessModes;

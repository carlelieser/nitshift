import React from "react";
import { BrightnessMedium, ChevronRight } from "mui-symbols";
import SettingsCard from "../../settings-card";
import EditBrightnessModesDialog from "@dialogs/edit-brightness-modes";
import { useMenuState } from "@hooks";

const BrightnessModes = () => {
	const { open, openMenu, closeMenu } = useMenuState();

	return (
		<>
			<EditBrightnessModesDialog open={open} onClose={closeMenu} />
			<SettingsCard
				icon={<BrightnessMedium />}
				endIcon={<ChevronRight />}
				title={"Profiles"}
				subtitle={"Manage brightness profiles"}
				onClick={openMenu}
			/>
		</>
	);
};

export default BrightnessModes;

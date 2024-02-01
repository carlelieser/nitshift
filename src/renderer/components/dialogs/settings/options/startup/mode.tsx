import SettingsCard from "../../settings-card";
import { Wysiwyg } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@hooks";
import { capitalize } from "lodash";
import ModeMenu from "./mode-menu";
import { useState } from "react";
import { setStartupSettings } from "@reducers/app";
import update from "immutability-helper";
import { AppState } from "@common/types";

const Mode = () => {
	const dispatch = useAppDispatch();
	const startup = useAppSelector((state) => state.app.startup);
	const [open, setOpen] = useState<boolean>(false);

	const openMenu = () => setOpen(true);
	const closeMenu = () => setOpen(false);

	const handleModeChange = (mode: AppState["mode"]) => {
		dispatch(
			setStartupSettings(
				update(startup, {
					mode: {
						$set: mode
					}
				})
			)
		);
	};

	return (
		<>
			<ModeMenu open={open} onClose={closeMenu} value={startup.mode} onChange={handleModeChange} />
			<SettingsCard
				title={"Default view"}
				subtitle={"Change the default view mode."}
				icon={<Wysiwyg />}
				value={capitalize(startup.mode)}
				onClick={openMenu}
			/>
		</>
	);
};

export default Mode;

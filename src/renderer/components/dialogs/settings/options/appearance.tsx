import React, { useRef, useState } from "react";
import SettingsCard from "../settings-card";
import { Palette } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@hooks";
import AppearanceMenu, { AppearanceMenuProps } from "@components/appearance-menu";
import { setAppearance } from "@reducers/app";
import { capitalize } from "lodash";

const Appearance = () => {
	const [open, setOpen] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const appearance = useAppSelector((state) => state.app.appearance);
	const ref = useRef<HTMLButtonElement>();

	const openMenu = () => setOpen(true);
	const closeMenu = () => setOpen(false);

	const handleAppearanceChange: AppearanceMenuProps["onChange"] = (appearance) => dispatch(setAppearance(appearance));

	return (
		<>
			<AppearanceMenu open={open} value={appearance} onChange={handleAppearanceChange} onClose={closeMenu} />
			<SettingsCard
				title={"Appearance"}
				subtitle={`Switch between light and dark themes.`}
				icon={<Palette />}
				value={capitalize(appearance)}
				onClick={openMenu}
				ref={ref}
			/>
		</>
	);
};

export default Appearance;

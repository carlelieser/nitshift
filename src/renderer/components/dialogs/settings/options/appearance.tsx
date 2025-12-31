import React, { useMemo } from "react";
import SettingsCard from "../settings-card";
import { Palette } from "mui-symbols";
import { useAppDispatch, useAppSelector, useMenuState } from "@hooks";
import AppearanceMenu, { AppearanceMenuProps } from "@components/appearance-menu";
import { setAppearance, setSyncAppearance } from "@reducers/app";
import { capitalize } from "lodash";
import { batch } from "react-redux";

const Appearance = () => {
	const { open, openMenu, closeMenu } = useMenuState();
	const dispatch = useAppDispatch();
	const appearance = useAppSelector((state) => state.app.appearance);
	const shouldSync = useAppSelector((state) => state.app.syncAppearance);
	const autoAppearance = useMemo(() => (shouldSync ? "auto" : appearance), [shouldSync, appearance]);
	const optionLabel = useMemo(() => capitalize(autoAppearance), [autoAppearance]);

	const handleAppearanceChange: AppearanceMenuProps["onChange"] = (appearance) => {
		if (appearance === "auto") {
			dispatch(setSyncAppearance(true));
		} else {
			batch(() => {
				dispatch(setSyncAppearance(false));
				dispatch(setAppearance(appearance));
			});
		}
	};

	return (
		<>
			<AppearanceMenu open={open} value={autoAppearance} onChange={handleAppearanceChange} onClose={closeMenu} />
			<SettingsCard
				title={"Appearance"}
				subtitle={"Switch between light and dark themes"}
				icon={<Palette />}
				value={optionLabel}
				onClick={openMenu}
			/>
		</>
	);
};

export default Appearance;

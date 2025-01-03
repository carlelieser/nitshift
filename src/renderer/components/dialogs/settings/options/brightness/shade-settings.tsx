import SettingsCard from "../../settings-card";
import { BacklightHigh, BacklightLow, DonutSmallRoundedFilled, KeyboardArrowRight, ResetSettings } from "mui-symbols";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { setMaxShadeLevel, setMinShadeLevel } from "@renderer/reducers/app";
import Slider, { SliderProps } from "@renderer/components/slider";
import { batch } from "react-redux";
import { Button, Chip, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { loadMaxShadeLevel, loadMinShadeLevel } from "@renderer/storage";

const ShadeSettings = () => {
	const minShadeLevel = useAppSelector((state) => state.app.minShadeLevel);
	const maxShadeLevel = useAppSelector((state) => state.app.maxShadeLevel);
	const [defaultMinShadeLevel, setDefaultMinShadeLevel] = useState<number>();
	const [defaultMaxShadeLevel, setDefaultMaxShadeLevel] = useState<number>();
	const dispatch = useAppDispatch();

	const isDefault = useMemo(() => minShadeLevel === 10 && maxShadeLevel === 100, [minShadeLevel, maxShadeLevel]);

	const hasChanged = useMemo(
		() => minShadeLevel !== defaultMinShadeLevel || maxShadeLevel !== defaultMaxShadeLevel,
		[minShadeLevel, maxShadeLevel, defaultMinShadeLevel, defaultMaxShadeLevel]
	);

	const confirm = useCallback(() => {
		setDefaultMinShadeLevel(minShadeLevel);
		setDefaultMaxShadeLevel(maxShadeLevel);
		batch(() => {
			dispatch(setMinShadeLevel({ level: minShadeLevel, save: true, apply: true }));
			dispatch(setMaxShadeLevel({ level: maxShadeLevel, save: true, apply: true }));
		});
	}, [minShadeLevel, maxShadeLevel, dispatch]);

	const cancelChanges = () => {
		if (defaultMinShadeLevel === undefined || defaultMaxShadeLevel === undefined) return;
		batch(() => {
			dispatch(setMinShadeLevel({ level: defaultMinShadeLevel, save: true, apply: true }));
			dispatch(setMaxShadeLevel({ level: defaultMaxShadeLevel, save: true, apply: true }));
		});
	};

	const handleShadeLevelChange: SliderProps["onChange"] = (value) => {
		batch(() => {
			dispatch(setMinShadeLevel({ level: value[0] }));
			dispatch(setMaxShadeLevel({ level: value[1] }));
		});
	};

	const handleShadeLevelReset = () => {
		batch(() => {
			dispatch(setMinShadeLevel({ level: 10 }));
			dispatch(setMaxShadeLevel({ level: 100 }));
		});
	};

	useEffect(() => {
		if (defaultMinShadeLevel === undefined) setDefaultMinShadeLevel(minShadeLevel);
	}, [minShadeLevel]);

	useEffect(() => {
		if (defaultMaxShadeLevel === undefined) setDefaultMaxShadeLevel(maxShadeLevel);
	}, [maxShadeLevel]);

	useEffect(() => {
		return () => {
			batch(() => {
				dispatch(setMinShadeLevel({ level: loadMinShadeLevel() }));
				dispatch(setMaxShadeLevel({ level: loadMaxShadeLevel() }));
			});
		};
	}, []);

	return (
		<SettingsCard
			title={"Shade Level Range"}
			subtitle={
				<Stack direction={"row"} gap={1}>
					<Chip size={"small"} icon={<BacklightLow />} label={minShadeLevel} />
					<Chip size={"small"} icon={<BacklightHigh />} label={maxShadeLevel} />
				</Stack>
			}
			isPremium={true}
			wrap={false}
			icon={<DonutSmallRoundedFilled />}
			endIcon={
				<Tooltip title={"Reset"}>
					<IconButton disabled={isDefault} onClick={handleShadeLevelReset}>
						<ResetSettings />
					</IconButton>
				</Tooltip>
			}
			isCollapsible={false}
			defaultCollapsed={false}
		>
			<Paper sx={{ borderRadius: 4 }}>
				<Stack>
					<Slider
						value={[minShadeLevel, maxShadeLevel]}
						min={0}
						max={100}
						onChange={handleShadeLevelChange}
					/>
					{hasChanged && (
						<Stack direction={"row"} justifyContent={"flex-end"} gap={1} p={1}>
							<Button size={"small"} color={"inherit"} sx={{ opacity: 0.5 }} onClick={cancelChanges}>
								Cancel
							</Button>
							<Button size={"small"} endIcon={<KeyboardArrowRight />} onClick={confirm}>
								Confirm
							</Button>
						</Stack>
					)}
				</Stack>
			</Paper>
		</SettingsCard>
	);
};

export default ShadeSettings;

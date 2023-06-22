import React from "react";
import { ListItemIcon, ListItemText, MenuItem, MenuList, Typography } from "@mui/material";
import { useAppSelector } from "../../hooks";
import { RadioButtonChecked, RadioButtonUnchecked } from "@mui/icons-material";
import { clone } from "lodash";

interface MonitorMultiSelectProps {
	value: Array<string>;
	onChange: (monitors: Array<string>) => void;
}

const MonitorMultiSelectList: React.FC<MonitorMultiSelectProps> = ({ value, onChange }) => {
	const monitors = useAppSelector((state) => state.app.monitors);

	const toggleItemSelected = (monitorId: string) => {
		if (value.includes(monitorId)) {
			onChange(value.filter((id) => monitorId !== id));
		} else {
			value.push(monitorId);
			onChange(clone(value));
		}
	};

	return (
		<MenuList>
			{monitors.map(({ id, name }) => (
				<MenuItem key={`multi-select-item-${id}`} selected={value.includes(id)} onClick={() => toggleItemSelected(id)}>
					<ListItemIcon>{value.includes(id) ? <RadioButtonChecked /> : <RadioButtonUnchecked />}</ListItemIcon>
					<ListItemText
						primary={name}
						secondary={
							<Typography variant={"subtitle2"} sx={{ opacity: 0.7 }} maxWidth={200} noWrap={true}>
								{id}
							</Typography>
						}
					/>
				</MenuItem>
			))}
		</MenuList>
	);
};

export default MonitorMultiSelectList;

import React from "react";
import { ListItemIcon, ListItemText, MenuItem, MenuList, Typography } from "@mui/material";
import { useAppSelector } from "@hooks";
import { RadioButtonCheckedOutlined, RadioButtonUncheckedOutlined } from "mui-symbols";
import { clone } from "lodash";
import { UIMonitor } from "@common/types";

interface MonitorMultiSelectProps {
	value: Array<UIMonitor>;
	onChange: (monitors: Array<UIMonitor>) => void;
}

const MonitorMultiSelectList: React.FC<MonitorMultiSelectProps> = ({ value, onChange }) => {
	const monitors = useAppSelector((state) => state.app.monitors);

	const selected = (monitor: UIMonitor) => !!value.find((ref) => ref.id === monitor.id);

	const toggleItemSelected = (monitor: UIMonitor) => {
		if (selected(monitor)) {
			onChange(value.filter((ref) => ref.id !== monitor.id));
		} else {
			value.push(monitor);
			onChange(clone(value));
		}
	};

	return (
		<MenuList>
			{monitors.map((monitor) => (
				<MenuItem
					key={`multi-select-item-${monitor.id}`}
					selected={selected(monitor)}
					onClick={() => toggleItemSelected(monitor)}
				>
					<ListItemIcon>
						{selected(monitor) ? <RadioButtonCheckedOutlined /> : <RadioButtonUncheckedOutlined />}
					</ListItemIcon>
					<ListItemText
						primary={<Typography textTransform={"uppercase"}>{monitor.nickname}</Typography>}
						secondary={
							<Typography variant={"subtitle2"} sx={{ opacity: 0.7 }} maxWidth={250} noWrap={true}>
								{monitor.id}
							</Typography>
						}
					/>
				</MenuItem>
			))}
		</MenuList>
	);
};

export default MonitorMultiSelectList;

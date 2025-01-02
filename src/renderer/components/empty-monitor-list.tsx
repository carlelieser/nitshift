import { Paper, Skeleton, Stack } from "@mui/material";
import { useMemo } from "react";
import Slider from "./slider";

const EmptyMonitorList = () => {
	const arr = useMemo(() => Array.from({ length: 3 }), []);
	return (
		<Stack flex={1} gap={2} p={2}>
			<Paper sx={{ borderRadius: 4 }}>
				<Slider value={100} disabled={true} />
			</Paper>
			{arr.map((_, index) => (
				<Paper key={`empty-monitor-${index}`} sx={{ p: 2, borderRadius: 4 }}>
					<Skeleton variant={"text"} />
					<Skeleton variant={"text"} width={"33%"} />
					<Stack pt={1}>
						<Slider value={100} disabled={true} />
					</Stack>
				</Paper>
			))}
		</Stack>
	);
};

export default EmptyMonitorList;

import { createContext, Dispatch, SetStateAction } from "react";
import { ScheduleItemContent } from "@common/types";
import { Dayjs } from "dayjs";

export const ScheduleContext = createContext<
	Omit<ScheduleItemContent, "time"> & {
		time: Dayjs | null;
		setTime: Dispatch<SetStateAction<Dayjs | null>>;
		setType: Dispatch<SetStateAction<ScheduleItemContent["type"]>>;
		setBrightness: Dispatch<SetStateAction<number>>;
	}
>({
	type: "manual",
	brightness: 100,
	monitors: [],
	time: null,
	setTime: () => {},
	setType: () => {},
	setBrightness: () => {}
});

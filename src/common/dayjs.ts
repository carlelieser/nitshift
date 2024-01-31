import dayjs, { Dayjs } from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

const DEFAULT_TIMEZONE = "America/New_York";

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(DEFAULT_TIMEZONE);

const getDateFromTime = (time: string) => dayjs(time, "hh:mm A");

export { dayjs, Dayjs, getDateFromTime, DEFAULT_TIMEZONE };

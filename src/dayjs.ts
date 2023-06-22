import { Dayjs } from "dayjs";

const dayjs = require("dayjs");

const customParseFormat = require("dayjs/plugin/customParseFormat");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const relativeTime = require("dayjs/plugin/relativeTime");

const DEFAULT_TIMEZONE = "America/New_York";

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(DEFAULT_TIMEZONE);

const getDateFromTime = (time: string) => dayjs(time, "hh:mm A");

export { dayjs, Dayjs, getDateFromTime, DEFAULT_TIMEZONE };

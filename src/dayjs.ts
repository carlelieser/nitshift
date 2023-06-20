import { Dayjs } from "dayjs";

const dayjs = require("dayjs");

const customParseFormat = require("dayjs/plugin/customParseFormat");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/New_York");

const getDateFromTime = (time: string) => dayjs(time, "hh:mm A");

export { dayjs, Dayjs, getDateFromTime };

import { isDev } from "../common/utils";

export const stripe = require("stripe")(
	isDev
		? "sk_test_51NJJuwL8krf4c13Z4NTIhI7C3E673jPBqnE9EyZodi4jhynY0H6JZddFmOc58OTWPDpZSdUQTrTnnUGiyKf3cRMn00JtWYOUV5"
		: "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"
);

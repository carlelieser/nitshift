import { isDev } from "../common/utils";

export const stripe = require("stripe")(
	isDev
		? "sk_test_51NJJuwL8krf4c13Z4NTIhI7C3E673jPBqnE9EyZodi4jhynY0H6JZddFmOc58OTWPDpZSdUQTrTnnUGiyKf3cRMn00JtWYOUV5"
		: "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"
);

export const findCustomerByEmail = async (email: string) => {
	const response = await stripe.customers.list({
		email,
		limit: 1,
	});
	if (!response || response?.data?.length === 0) throw new Error("A customer with that email doesn't exist.");
	return response.data[0];
};

export const getMostRecentPaymentIntentForCustomer = async (customerId: string) => {
	const response = await stripe.paymentIntents.list({
		customer: customerId,
	});
	if (!response || response?.data?.length === 0) throw new Error("A payment couldn't be found for this customer.");
	return response.data[0];
};
